// stripEmail.ts

export interface StrippedContent {
  plain: string | null;
  html: string | null;
}

/**
 * stripEmail
 *
 * Takes a raw IMAP FETCH response string (including the IMAP wrapper and MIME multipart body),
 * finds the dynamically generated boundary, and returns an object with `plain` and `html`
 * bodies (either may be null if not present). This version tolerates extra headers
 * (e.g. Content-Transfer-Encoding) before the blank line.
 *
 * @param raw - The raw IMAP FETCH response as a single string.
 * @returns An object containing `{ plain, html }`.
 * @throws If no boundary is found or the boundary‐delimited block cannot be extracted.
 */
export function stripEmail(raw: string): StrippedContent {
  // 1) Extract the boundary token from the Content-Type header:
  const boundaryMatch = raw.match(/boundary="([^"]+)"/i);
  if (!boundaryMatch) {
    throw new Error("No boundary token found in the raw input.");
  }
  const boundary = boundaryMatch[1]; // e.g. "--_NmP-71e2dd92a018b7de-Part_1"

  // 2) Build the opening and closing boundary strings:
  const OPEN_BOUNDARY = `--${boundary}`; // e.g. "----_NmP-71e2dd92a018b7de-Part_1"
  const CLOSING_BOUNDARY = `--${boundary}--`; // e.g. "----_NmP-71e2dd92a018b7de-Part_1--"

  // 3) Locate the first occurrence of the opening boundary:
  const firstIdx = raw.indexOf(OPEN_BOUNDARY);
  if (firstIdx === -1) {
    throw new Error(`Opening boundary "${OPEN_BOUNDARY}" not found.`);
  }

  // 4) Locate the closing boundary (search from the first boundary onward):
  const closingIdx = raw.indexOf(CLOSING_BOUNDARY, firstIdx);
  if (closingIdx === -1) {
    throw new Error(`Closing boundary "${CLOSING_BOUNDARY}" not found.`);
  }

  // 5) Slice out everything between the opening boundary and the closing boundary:
  const twoPartsBlock = raw.slice(firstIdx, closingIdx).trim();
  // Now twoPartsBlock contains something like:
  // --<boundary>
  // Content-Type: text/plain; charset="utf-8"
  // Content-Transfer-Encoding: quoted-printable
  //
  // <plain-body>
  //
  // --<boundary>
  // Content-Type: text/html; charset="utf-8"
  // Content-Transfer-Encoding: quoted-printable
  //
  // <html-body>

  // 6) Split on the same boundary to separate potential segments:
  const rawSegments = twoPartsBlock
    .split(OPEN_BOUNDARY)
    .map((segment) => segment.trim())
    .filter(Boolean);

  // Initialize as null; set if found
  let plain: string | null = null;
  let html: string | null = null;

  // 7) Helper: strip away all inner headers until the first blank line, then return the rest
  function extractBody(segment: string): string | null {
    // Look for the first empty line (\r?\n\r?\n), then capture everything after it
    const m = segment.match(/\r?\n\r?\n([\s\S]*)$/);
    if (!m) {
      return null;
    }
    return m[1].trim();
  }

  // 8) For each segment, detect its Content-Type and extract its body
  for (const segment of rawSegments) {
    if (/Content-Type:\s*text\/plain/i.test(segment)) {
      const body = extractBody(segment);
      if (body !== null) {
        plain = body;
      }
    } else if (/Content-Type:\s*text\/html/i.test(segment)) {
      const body = extractBody(segment);
      if (body !== null) {
        html = body;
      }
    }
  }

  return { plain, html };
}
