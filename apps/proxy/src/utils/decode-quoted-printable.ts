// decodeQuotedPrintable.ts

/**
 * decodeQuotedPrintable
 *
 * Takes a string in “quoted‐printable” format (with soft line breaks, =XX hex escapes, etc.)
 * and returns a UTF-8–decoded version with all encodings expanded.
 *
 * @param input - A quoted‐printable–encoded string.
 * @returns The decoded UTF-8 string.
 */
export function decodeQuotedPrintable(input: string): string {
  // 1) Remove “soft” line breaks: occurrences of “=\r\n” or “=\n” indicate
  //    that the line was broken for transport. We delete those sequences so the
  //    hex escapes aren’t split across lines.
  const withoutSoftBreaks = input.replace(/=\r?\n/g, "");

  // 2) Replace each “=XX” (where XX is two hex digits) with the corresponding byte.
  //    We build a byte array as we go, then decode as UTF-8 at the end.
  const bytes: number[] = [];
  let i = 0;
  while (i < withoutSoftBreaks.length) {
    const char = withoutSoftBreaks[i];

    if (char === "=" && i + 2 < withoutSoftBreaks.length) {
      // Look ahead for two hex digits
      const hex = withoutSoftBreaks.substr(i + 1, 2);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        // It’s a valid hex escape. Convert to a byte.
        bytes.push(parseInt(hex, 16));
        i += 3;
        continue;
      }
    }

    // Otherwise, it’s a normal ASCII character: push its code point
    bytes.push(withoutSoftBreaks.charCodeAt(i));
    i += 1;
  }

  // 3) Convert the byte array into a Buffer, then to a UTF-8 string
  return Buffer.from(bytes).toString("utf8");
}
