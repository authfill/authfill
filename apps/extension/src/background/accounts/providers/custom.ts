import { generateOTP } from "@extension/background/utils/demo";
import { addEmails } from "@extension/background/utils/email";
import { Email } from "@extension/types/email";
import { CustomAccountConfig } from "@extension/utils/storage";

type ImapConnectPayload = {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
};

type OutgoingEvent =
  | { event: "connect"; data: ImapConnectPayload }
  | { event: "fetch-emails"; data: { count: number } }
  | { event: "listen" };

export class CustomAccount {
  config: CustomAccountConfig;
  private ws: WebSocket | null = null;

  constructor(account: CustomAccountConfig) {
    this.config = account;
  }

  /**
   * Ensures a single WebSocket connection is established.
   * Resolves as soon as the IMAP server acknowledges the 'connect' handshake.
   */
  private init(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return resolve(this.ws);
      }

      this.ws = new WebSocket(`${import.meta.env.PUBLIC_WSS_URL}/imap`);

      // Once the socket is open, send the 'connect' payload
      this.ws.addEventListener("open", () => {
        if (!this.ws) {
          return reject(new Error("WebSocket failed to initialize."));
        }

        const payload: OutgoingEvent = {
          event: "connect",
          data: {
            host: this.config.credentials.host,
            port: this.config.credentials.port,
            user: this.config.credentials.user,
            password: this.config.credentials.password,
            secure: this.config.credentials.secure,
          },
        };
        this.ws.send(JSON.stringify(payload));
      });

      // Wait for the IMAP server to acknowledge with a "log" + "ok" message
      const onFirstMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === "log" && data.status === "ok") {
          if (this.ws) {
            this.ws.removeEventListener("message", onFirstMessage);
            resolve(this.ws);
          }
        }
      };

      this.ws.addEventListener("message", onFirstMessage);

      // Handle socket errors or premature closures
      this.ws.addEventListener("error", (err) => {
        reject(new Error("WebSocket error: " + err));
      });
      this.ws.addEventListener("close", () => {
        reject(new Error("WebSocket closed before handshake could complete."));
      });
    });
  }

  /**
   * Sends a JSON-encoded IMAP event over the WebSocket.
   * Assumes the socket is already open.
   */
  private sendEvent(message: OutgoingEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open.");
    }
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Core async function that listens for 'email' messages and optionally stops
   * when encountering a specific "log" message type.
   *
   * @param initialEvent The first event to send over the socket (e.g. "fetch-emails" or "listen").
   * @param stopOnLogStatus If provided, the function will resolve once receiving { type: "log", status: stopOnLogStatus }.
   * @param onEmail Optional callback for handling incoming emails
   */
  private async listenForEmails(
    initialEvent: OutgoingEvent,
    stopOnLogStatus?: string,
    onEmail?: (email: Email) => void,
  ): Promise<void> {
    const socket = await this.init();

    return new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        // If a stop condition is specified, and the message matches it, we resolve
        if (
          stopOnLogStatus &&
          data.type === "log" &&
          data.status === stopOnLogStatus
        ) {
          cleanup();
          resolve();
          return;
        }

        // Handle incoming emails
        if (data.type === "email") {
          const email: Email = data.email;
          if (onEmail) {
            onEmail(email);
          }
        }
      };

      const cleanup = () => {
        socket.removeEventListener("message", onMessage);
        socket.close();
        this.ws = null;
      };

      socket.addEventListener("message", onMessage);
      socket.addEventListener("error", (err) => {
        cleanup();
        reject(new Error("WebSocket error: " + err));
      });
      socket.addEventListener("close", () => {
        cleanup();
        reject(new Error("WebSocket closed unexpectedly"));
      });

      // Send the initial event
      this.sendEvent(initialEvent);
    });
  }

  /**
   * Fetches the latest `count` emails in one go, returning them as an array.
   */
  public async getLatestEmails(count: number) {
    const collected: Email[] = [];

    await this.listenForEmails(
      { event: "fetch-emails", data: { count } },
      "fetched-emails",
      (email) => collected.push(email),
    );

    return collected;
  }

  public async connect() {
    if (this.config.email === "test@authfill.com") {
      console.info(`[${this.config.id}] Test account detected`);

      const otp = generateOTP();

      addEmails(
        [
          {
            from: "Test Sender <sender@authfill.com>",
            subject: `Your verification code is ${otp}`,
            html: `Dear Test User,\n\nYour verification code is ${otp}\n\nBest Regards,\nAuthFill`,
            date: new Date().toISOString(),
            to: this.config.email,
            alwaysShow: true,
            otp,
          },
        ],
        this.config.id,
      );
      return;
    }

    if (this.ws)
      return console.warn(`[${this.config.id}] Account already connected`);

    const previousEmails = await this.getLatestEmails(10);
    addEmails(previousEmails, this.config.id);

    this.listenForEmails({ event: "listen" }, undefined, (email) => {
      addEmails([email], this.config.id);
    });

    console.info(`[${this.config.id}] Account connected`);
  }

  public disconnect() {
    if (!this.ws)
      return console.warn(`[${this.config.id}] Account already disconnected`);

    this.ws?.close();
    this.ws = null;

    console.info(`[${this.config.id}] Account disconnected`);
  }

  public toConfig() {
    return this.config;
  }
}
