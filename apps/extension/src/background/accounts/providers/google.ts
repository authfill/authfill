import { checkEmails } from "@extension/background/utils/email";
import { GoogleAccountConfig } from "@extension/utils/storage";
import axios from "axios";

export class GoogleAccount {
  config: GoogleAccountConfig;
  interval: NodeJS.Timeout | null = null;

  constructor(account: GoogleAccountConfig) {
    this.config = account;
  }

  /**
   * Decode a Base64URL‐encoded string into UTF‐8.
   */
  private decodeBase64Url(data: string): string {
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
  private extractBodies(part: any): { text?: string; html?: string } {
    const result: { text?: string; html?: string } = {};

    if (part.mimeType === "text/plain" && part.body?.data) {
      result.text = this.decodeBase64Url(part.body.data);
    } else if (part.mimeType === "text/html" && part.body?.data) {
      result.html = this.decodeBase64Url(part.body.data);
    } else if (Array.isArray(part.parts)) {
      for (const subPart of part.parts) {
        const subBodies = this.extractBodies(subPart);
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

  /**
   * Fetches the latest `count` Gmail emails using Axios and returns an array of objects
   * containing { subject, from, to, bodyHtml, bodyText }.
   */
  async getLatestEmails(count: number) {
    const { accessToken } = this.config.credentials;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    };

    // 1. List the latest `count` emails (newest first by default)
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/emails?maxResults=${count}`;
    let listResponse;
    try {
      listResponse = await axios.get(listUrl, { headers });
    } catch (err: any) {
      const status = err.response?.status || "unknown";
      const text = err.response?.data || err.message;
      throw new Error(
        `Failed to list emails: ${status} ${JSON.stringify(text)}`,
      );
    }

    const emails: Array<{ id: string }> = listResponse.data.emails || [];
    const results: Array<{
      id: string;
      subject: string;
      from: string;
      to: string;
      html: string;
      text: string;
    }> = [];

    // 2. For each message ID, fetch full details and extract fields
    for (const msg of emails) {
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
      const bodies = this.extractBodies(msgJson.payload);
      const bodyText = bodies.text || "";
      const bodyHtml = bodies.html || "";

      results.push({
        id: msg.id,
        subject,
        from,
        to,
        html: bodyHtml,
        text: bodyText,
      });
    }

    return results;
  }

  async connect() {
    if (this.interval)
      return console.warn(`[${this.config.id}] Account already connected`);

    const previousEmails = await this.getLatestEmails(5);
    checkEmails(previousEmails);

    const blacklist: string[] = previousEmails.map((email) => email.id);

    this.interval = setInterval(async () => {
      let emails = await this.getLatestEmails(1);
      emails = emails.filter((email) => !blacklist.includes(email.id));

      for (const email of emails) {
        blacklist.push(email.id);
      }

      if (emails.length > 0) checkEmails(emails);
    }, 1000);

    console.info(`[${this.config.id}] Account connected`);
  }

  async disconnect() {
    if (!this.interval)
      return console.warn(`[${this.config.id}] Account already disconnected`);

    clearInterval(this.interval);
    this.interval = null;

    console.info(`[${this.config.id}] Account disconnected`);
  }

  public toConfig() {
    return this.config;
  }
}
