import { CFImap } from "cf-imap";
import { WSContext } from "hono/ws";
import { processEmail } from "../services/imap";
import { WebSocketMessage } from "../types";

/**
 * Fetch the last `count` emails from INBOX and push them over WebSocket.
 *
 * @returns number of emails sent
 */
export const handleEmailFetch = async (
  ws: WSContext<WebSocket>,
  imap: CFImap,
  count: number,
): Promise<number> => {
  // 1) Select the folder and get total message count
  const folderInfo = await imap.selectFolder("INBOX");
  const totalEmailCount = folderInfo["emails"];
  if (totalEmailCount == null) {
    throw new Error("No email key found while fetching emails");
  }
  // 2) Fetch the last `count` messages (or fewer if not enough emails)
  const fetchCount = Math.min(totalEmailCount, count);
  if (fetchCount === 0) {
    return 0;
  }

  const lower = totalEmailCount - fetchCount + 1;
  const upper = totalEmailCount;
  let emails;
  try {
    emails = await imap.fetchEmails({
      limit: [lower, upper],
      folder: "INBOX",
      fetchBody: true,
    });
  } catch (err) {
    console.error("Error fetching emails in handleEmailFetch:", err);
    throw err;
  }

  // 3) Send each over WebSocket
  for (const email of emails) {
    if (!email.from || !email.date || !email.subject) continue;
    const date = new Date(email.date);
    if (isNaN(date.getTime())) {
      continue;
    }

    try {
      const message: WebSocketMessage = {
        type: "email",
        email: processEmail(email),
      };
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.warn("Error stripping email", e);
      continue;
    }
  }

  return emails.filter((email) => !!email.from).length;
};

/**
 * A more robust IDLE loop that listens for new messages in INBOX,
 * sends them to the client via WebSocket, and recovers from “weird” IMAP replies.
 *
 * Additionally logs every raw line from the server (via console.info) so you can inspect it.
 * This function never returns unless an unrecoverable error is thrown.
 */
export const handleIdleListen = async (
  ws: WSContext<WebSocket>,
  imap: CFImap,
) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  /**
   * Reads from imap.reader until a full CRLF-terminated line is available,
   * then returns that line (without the trailing CRLF). Throws if connection closes.
   */
  async function readLine(): Promise<string> {
    let buffer = "";
    while (true) {
      const chunk = await imap.reader?.read();
      if (!chunk?.value) {
        throw new Error("Connection closed by server");
      }
      buffer += decoder.decode(chunk.value, { stream: true });
      const idx = buffer.indexOf("\r\n");
      if (idx >= 0) {
        const line = buffer.slice(0, idx + 2);
        // Discard the remainder
        buffer = buffer.slice(idx + 2);
        return line.trimEnd();
      }
      // Otherwise, keep reading until we see \r\n
    }
  }

  // Generate a unique IMAP tag for each command (e.g. "A0001", "A0002", ...)
  let tagCounter = 0;
  function nextTag(): string {
    tagCounter += 1;
    return "A" + String(tagCounter).padStart(4, "0");
  }

  while (true) {
    // Always re-select INBOX before starting IDLE, to ensure we have the right state.
    try {
      await imap.selectFolder("INBOX");
    } catch (err) {
      console.error("Error selecting INBOX before IDLE:", err);
      // Wait a moment and retry
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    // 1) Send a tagged IDLE command
    const idleTag = nextTag();
    const idleCmd = `${idleTag} IDLE\r\n`;
    try {
      await imap.writer?.write(encoder.encode(idleCmd));
    } catch (err) {
      console.error("Error writing IDLE command:", err);
      throw err;
    }

    // 2) Wait for the server to respond with "+ idling"
    let continuation: string;
    try {
      continuation = await readLine();
      console.info(`[IMAP RAW] ${continuation}`);
    } catch (err) {
      console.error("Error waiting for IDLE continuation:", err);
      throw err;
    }
    if (!continuation.startsWith("+")) {
      // Server did not grant IDLE; retry after a short delay
      console.error("IDLE was not granted: " + continuation);
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }


    // 3) Loop, reading server‐pushed lines until we see a “* n EXISTS” or a timeout
    let existsMatch: RegExpExecArray | null = null;
    const existsRegex = /^\* (\d+) EXISTS$/;

    // Many servers drop IDLE after ~29 minutes. We'll force‐exit and re‐IDLE at 28 minutes.
    const IDLE_TIMEOUT = 28 * 60 * 1000; // 28 minutes
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutHandle = setTimeout(() => resolve(null), IDLE_TIMEOUT);
    });

    while (true) {
      const lineOrNull = await Promise.race([
        readLine().then((line) => line),
        timeoutPromise, // resolves to null after 28 minutes
      ]);

      // If timeout fired, break out to send DONE and re‐IDLE
      if (lineOrNull === null) {
        console.info(
          `[IMAP RAW] <IDLE timed out after ${IDLE_TIMEOUT / 1000}s>`,
        );
        break;
      }

      const line = (lineOrNull as string).trim();
      console.info(`[IMAP RAW] ${line}`);

      // a) If we see “* n EXISTS”, break to fetch that new message
      const m = existsRegex.exec(line);
      if (m) {
        existsMatch = m;
        break;
      }

      // b) If the server ended our IDLE prematurely with a tagged OK: break and re‐IDLE
      if (line.startsWith(idleTag) && /\bOK\b/i.test(line)) {
        console.warn("Server ended IDLE: " + line);
        break;
      }

      // c) If the server responded BAD/NO to our IDLE: log and break
      if (line.startsWith(idleTag) && /\b(NO|BAD)\b/i.test(line)) {
        console.error("IDLE got BAD/NO: " + line);
        break;
      }

      // Otherwise: unsolicited (FLAGS, RECENT, etc.). Continue looping.
    }

    clearTimeout(timeoutHandle!);

    // 4) Terminate IDLE by sending DONE
    try {
      await imap.writer?.write(encoder.encode("DONE\r\n"));
      console.info(`[IMAP RAW] >> DONE`);
    } catch (err) {
      console.error("Error writing DONE:", err);
      throw err;
    }

    // 5) Read lines until we see the tagged OK (or NO/BAD) for our IDLE
    //    The server may emit lines like "* 1 RECENT" or "* OK Still here" before the tagged OK.
    while (true) {
      let doneResponse: string;
      try {
        doneResponse = await readLine();
        console.info(`[IMAP RAW] ${doneResponse}`);
      } catch (err) {
        console.error("Error reading after DONE:", err);
        throw err;
      }

      // If it’s a tagged line for our IDLE, break out on OK or NO/BAD
      if (doneResponse.startsWith(idleTag)) {
        if (/\bOK\b/.test(doneResponse)) {
          break;
        }
        if (/\b(NO|BAD)\b/.test(doneResponse)) {
          console.error("IDLE ended with NO/BAD: " + doneResponse);
          break;
        }
      }

      // Otherwise, it’s unsolicited (e.g. "* 1 RECENT", "* OK Still here", etc.). Ignore and continue.
    }

    // 6) If we detected a new EXISTS count, fetch exactly that new message
    if (existsMatch) {
      const newSeqNum = Number(existsMatch[1]);

      try {
        await imap.selectFolder("INBOX");
      } catch (err) {
        console.error("Error re-selecting INBOX before fetch:", err);
      }

      try {
        const mails = await imap.fetchEmails({
          limit: [newSeqNum, newSeqNum],
          folder: "INBOX",
          fetchBody: true,
        });

        for (const mail of mails) {
          if (!mail.from || !mail.date || !mail.subject) continue;
          const date = new Date(mail.date);
          if (isNaN(date.getTime())) {
            continue;
          }

          const message: WebSocketMessage = {
            type: "email",
            email: processEmail(mail),
          };
          ws.send(JSON.stringify(message));
        }
      } catch (err) {
        console.error("Error fetching new email:", err);
      }
    }

    // 7) Short pause, then re‐enter IDLE
    await new Promise((r) => setTimeout(r, 1000));
  }
};
