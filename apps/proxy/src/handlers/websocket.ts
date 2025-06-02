import { CFImap } from "cf-imap";
import { WebSocketMessage } from "../types";
import { processEmail } from "../services/imap";
import { WSContext } from "hono/ws";

export const handleEmailFetch = async (ws: WSContext<WebSocket>, imap: CFImap, count: number) => {
  const folder = await imap.selectFolder("INBOX");
  const totalEmailCount = folder["emails"];

  if (!totalEmailCount) {
    throw new Error("No email key found while fetching emails");
  }
  if (totalEmailCount < count) {
    throw new Error("Not enough emails in the folder");
  }

  const emails = await imap.fetchEmails({
    limit: [totalEmailCount - count + 1, totalEmailCount],
    folder: "INBOX",
    fetchBody: true,
  });

  for (const email of emails) {
    try {
      const message: WebSocketMessage = {
        type: "email",
        status: "success",
        email: processEmail(email)
      };
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.log("Error stripping email", e);
      continue;
    }
  }

  return emails.length;
};

export const handleIdleListen = async (ws: WSContext<WebSocket>, imap: CFImap) => {
  while (true) {
    await imap.selectFolder("INBOX");
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    await imap.writer?.write(encoder.encode("AUTHFILLIDLE IDLE\r\n"));
    const data = await imap.reader?.read();
    const decoded = data?.value ? decoder.decode(data.value) : "";
    
    if (!decoded.includes("idling")) {
      throw new Error("Idling failed");
    }

    ws.send(JSON.stringify({ status: "ok", revd: decoded }));
    const newEmailData = await imap.reader?.read();
    const newEmail = newEmailData?.value ? decoder.decode(newEmailData.value) : "";
    
    const regex = /.*\* ([0-9]+) EXISTS.*/g;
    const match = regex.exec(newEmail);
    
    if (match) {
      await imap.writer?.write(encoder.encode("DONE\r\n"));
      await imap.selectFolder("INBOX");
      try {
        const mails = await imap.fetchEmails({
          limit: [Number(match[1]), Number(match[1])],
          folder: "INBOX",
          fetchBody: true,
        });
        
        const mail = mails[mails.length - 1];
        if (mail) {
          const message: WebSocketMessage = {
            type: "email",
            status: "success",
            email: processEmail(mail)
          };
          ws.send(JSON.stringify(message));
        }
      } catch (e) {
        console.log("Error fetching email", e);
      }
    }
  }
}; 