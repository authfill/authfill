// stripEmail.ts

export interface StrippedContent {
  plain: string | null;
  html: string | null;
}

/**
 * stripEmail
 *
 * Takes a raw IMAP FETCH response string (including the IMAP wrapper and MIME multipart body).
 * - If a multipart boundary is present, it extracts and returns the text/plain and text/html parts (either may be null).
 * - If no boundary is found, it treats the entire body as a single HTML payload (returns it under `html`; `plain` stays null).
 *
 * @param raw - The raw IMAP FETCH response as a single string.
 * @returns An object containing `{ plain, html }`.
 * @throws If neither a boundary nor any HTML payload can be found.
 */
export function stripEmail(raw: string): StrippedContent {
  // First, strip off the IMAP FETCH wrapper line (e.g. "* 11836 FETCH (BODY[TEXT] {…}\n")
  // so we only have the actual message content afterward.
  const withoutFetch = raw.replace(/^\*\s+\d+\s+FETCH[^\r\n]*\r?\n/, "");

  // Try to locate a boundary parameter in the headers:
  const boundaryMatch = withoutFetch.match(/boundary="?([^"\s]+)("|\s)/i);
  if (boundaryMatch) {
    // ────────────────────────────────
    // CASE A: We found a boundary → extract multipart/alternative parts.
    // ────────────────────────────────
    const boundaryParam = boundaryMatch[1]; // e.g. "--_NmP-71e2dd92a018b7de-Part_1"
    const openBoundary = `--${boundaryParam}`; // e.g. "----_NmP-71e2dd92a018b7de-Part_1"
    const closingBoundary = `--${boundaryParam}--`; // e.g. "----_NmP-71e2dd92a018b7de-Part_1--"

    // Find the first occurrence of the opening delimiter
    const firstIdx = withoutFetch.indexOf(openBoundary);
    if (firstIdx === -1) {
      throw new Error(`Opening boundary "${openBoundary}" not found.`);
    }

    // Find the closing delimiter after that
    const closingIdx = withoutFetch.indexOf(closingBoundary, firstIdx);
    if (closingIdx === -1) {
      throw new Error(`Closing boundary "${closingBoundary}" not found.`);
    }

    // Extract everything between openBoundary and closingBoundary (exclusive)
    const twoPartsBlock = withoutFetch.slice(firstIdx, closingIdx).trim();
    // Split on openBoundary to isolate each segment (plain vs HTML)
    const rawSegments = twoPartsBlock
      .split(openBoundary)
      .map((seg) => seg.trim())
      .filter(Boolean); // drop empty strings

    let plain: string | null = null;
    let html: string | null = null;

    // Helper to strip all headers from a segment, returning the body after the first blank line
    function extractBody(segment: string): string | null {
      // look for the first blank line (\r\n\r\n or \n\n), then grab everything after
      const m = segment.match(/\r?\n\r?\n([\s\S]*)$/);
      return m ? m[1].trim() : null;
    }

    for (const segment of rawSegments) {
      if (/Content-Type:\s*text\/plain/i.test(segment)) {
        const body = extractBody(segment);
        if (body !== null) plain = body;
      } else if (/Content-Type:\s*text\/html/i.test(segment)) {
        const body = extractBody(segment);
        if (body !== null) html = body;
      }
    }

    return { plain, html };
  } else {
    // ──────────────────────────────────
    // CASE B: No multipart boundary → assume the entire payload is HTML.
    // ──────────────────────────────────
    // After removing the FETCH line, what remains begins with the HTML doctype or <html> tag.
    // We need to strip off any trailing " BODY[HEADER.FIELDS…]" block if present.

    // Find where the next "BODY[HEADER.FIELDS" starts (that marks the start of header metadata).
    const headerFieldsIdx = withoutFetch.indexOf("BODY[HEADER.FIELDS");
    let htmlPortion: string;
    if (headerFieldsIdx !== -1) {
      // Take only the substring before that metadata section
      htmlPortion = withoutFetch.slice(0, headerFieldsIdx).trim();
    } else {
      // If no header‐fields marker, assume all of `withoutFetch` is HTML
      htmlPortion = withoutFetch.trim();
    }

    // If what's left doesn’t look like HTML, throw an error
    if (
      !/^<!doctype\s+html/i.test(htmlPortion) &&
      !/^<html/i.test(htmlPortion)
    ) {
      throw new Error(
        `No boundary found and no standalone HTML payload detected.`,
      );
    }

    return { plain: null, html: htmlPortion };
  }
}
