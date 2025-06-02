import { BaseProvider } from "@extension/background/listener/providers/base";
import { GoogleAccount } from "@extension/utils/storage";
import axios from "axios";

export class GoogleProvider extends BaseProvider {
  private account: GoogleAccount;

  constructor(account: GoogleAccount) {
    super();
    this.account = account;
  }

  /**
   * Fetches the latest `count` Gmail messages using Axios and returns an array of objects
   * containing { subject, from, to, bodyHtml, bodyText }.
   */
  async getLatestEmails(count: number) {
    const { accessToken } = this.account.credentials;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    };

    /**
     * Decode a Base64URL‐encoded string into UTF‐8.
     */
    function decodeBase64Url(data: string): string {
      // Convert Base64URL to regular Base64
      const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
      // atob will produce a binary‐string
      const decodedChars = atob(b64);
      // Convert binary‐string to Uint8Array
      const byteNumbers = new Array(decodedChars.length)
        .fill(0)
        .map((_, i) => decodedChars.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      // Decode to UTF-8 string
      return new TextDecoder().decode(byteArray);
    }

    /**
     * Recursively walk the payload to extract text/plain and text/html parts.
     */
    function extractBodies(part: any): { text?: string; html?: string } {
      const result: { text?: string; html?: string } = {};

      if (part.mimeType === "text/plain" && part.body?.data) {
        result.text = decodeBase64Url(part.body.data);
      } else if (part.mimeType === "text/html" && part.body?.data) {
        result.html = decodeBase64Url(part.body.data);
      } else if (Array.isArray(part.parts)) {
        for (const subPart of part.parts) {
          const subBodies = extractBodies(subPart);
          if (subBodies.text && !result.text) {
            result.text = subBodies.text;
          }
          if (subBodies.html && !result.html) {
            result.html = subBodies.html;
          }
          // If both found, break early
          if (result.text && result.html) break;
        }
      }

      return result;
    }

    // 1. List the latest `count` messages (newest first by default)
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`;
    let listResponse;
    try {
      listResponse = await axios.get(listUrl, { headers });
    } catch (err: any) {
      const status = err.response?.status || "unknown";
      const text = err.response?.data || err.message;
      throw new Error(
        `Failed to list messages: ${status} ${JSON.stringify(text)}`,
      );
    }

    const messages: Array<{ id: string }> = listResponse.data.messages || [];
    const results: Array<{
      subject: string;
      from: string;
      to: string;
      html: string;
      text: string;
    }> = [];

    // 2. For each message ID, fetch full details and extract fields
    for (const msg of messages) {
      const getUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      let msgResponse;
      try {
        msgResponse = await axios.get(getUrl, { headers });
      } catch (err: any) {
        console.warn(
          `Warning: Failed to fetch message ${msg.id}: ${err.response?.status || err.message}`,
        );
        continue;
      }
      const msgJson = msgResponse.data;

      // 3. Extract headers: Subject, From, To
      let subject = "";
      let from = "";
      let to = "";
      const headersArray: Array<{ name: string; value: string }> =
        msgJson.payload.headers || [];
      for (const header of headersArray) {
        const nameLower = header.name.toLowerCase();
        if (nameLower === "subject") {
          subject = header.value;
        } else if (nameLower === "from") {
          from = header.value;
        } else if (nameLower === "to") {
          to = header.value;
        }
      }

      // 4. Extract body (text/plain and text/html)
      const bodies = extractBodies(msgJson.payload);
      const bodyText = bodies.text || "";
      const bodyHtml = bodies.html || "";

      results.push({
        subject,
        from,
        to,
        html: bodyHtml,
        text: bodyText,
      });
    }

    return results;
  }
}
