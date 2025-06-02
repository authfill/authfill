import {
  BaseProvider,
  GeneratorEmail,
} from "@extension/background/listener/providers/base";
import { CustomAccount } from "@extension/utils/storage";

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

export class ImapProvider extends BaseProvider {
  private account: CustomAccount;
  private ws: WebSocket | null = null;

  constructor(account: CustomAccount) {
    super();
    this.account = account;
  }

  /**
   * Ensures a single WebSocket connection is established.
   * Resolves as soon as the IMAP server acknowledges the 'connect' handshake.
   */
  private initWebSocket(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return resolve(this.ws);
      }

      this.ws = new WebSocket("ws://localhost:4000/imap");

      // Once the socket is open, send the 'connect' payload
      this.ws.addEventListener("open", () => {
        if (!this.ws) {
          return reject(new Error("WebSocket failed to initialize."));
        }

        const payload: OutgoingEvent = {
          event: "connect",
          data: {
            host: this.account.credentials.host,
            port: this.account.credentials.port,
            user: this.account.credentials.user,
            password: this.account.credentials.password,
            secure: this.account.credentials.secure,
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
   * Core async generator that listens for 'email' messages and optionally stops
   * when encountering a specific "log" message type.
   *
   * @param initialEvent The first event to send over the socket (e.g. "fetch-emails" or "listen").
   * @param stopOnLogStatus If provided, the generator will break once receiving { type: "log", status: stopOnLogStatus }.
   */
  private async *emailIterator(
    initialEvent: OutgoingEvent,
    stopOnLogStatus?: string,
  ): AsyncGenerator<GeneratorEmail> {
    const socket = await this.initWebSocket();

    // Internal queue for received emails
    const pendingEmails: GeneratorEmail[] = [];
    // Resolver for the "wait until a new email arrives" promise
    let resolveNextEmail:
      | ((result: IteratorResult<GeneratorEmail>) => void)
      | null = null;
    // Flag to signal generator completion when stop condition is met
    let done = false;

    // Centralized onmessage handler (uses addEventListener to avoid overriding)
    const onMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      // If a stop condition is specified, and the message matches it, we signal completion
      if (
        stopOnLogStatus &&
        data.type === "log" &&
        data.status === stopOnLogStatus
      ) {
        done = true;
        // If someone is awaiting nextEmailPromise, notify them so they can exit
        if (resolveNextEmail) {
          resolveNextEmail({ value: null as any, done: true });
        }
        return;
      }

      // Whenever we see an 'email' payload, either resolve waiting consumer or queue it
      if (data.type === "email") {
        const email: GeneratorEmail = data.email;
        if (resolveNextEmail) {
          resolveNextEmail({ value: email, done: false });
          resolveNextEmail = null;
        } else {
          pendingEmails.push(email);
        }
      }
    };

    socket.addEventListener("message", onMessage);

    // Send the very first event (fetch-emails or listen)
    this.sendEvent(initialEvent);

    try {
      while (true) {
        // If we've already received new emails in our queue, yield them immediately
        if (pendingEmails.length > 0) {
          const nextEmail = pendingEmails.shift()!;
          yield nextEmail;
        } else {
          // If the queue is empty, wait for either a new email or the stop signal
          const nextEmailPromise: Promise<IteratorResult<GeneratorEmail>> =
            new Promise((resolve) => {
              resolveNextEmail = resolve;
            });

          const result = await nextEmailPromise;

          // If done === true, we break and clean up
          if (result.done || done) {
            break;
          }

          // Otherwise, yield the newly arrived email
          yield result.value;
        }
      }
    } finally {
      // Clean up: remove listener and close socket
      socket.removeEventListener("message", onMessage);
      socket.close();
      this.ws = null;
    }
  }

  /**
   * Fetches the latest `count` emails in one go, returning them as an array.
   */
  public async getLatestEmails(count: number): Promise<GeneratorEmail[]> {
    const collected: GeneratorEmail[] = [];
    // Use the iterator, telling it to stop when the IMAP server signals "fetched-emails"
    const iterator = this.emailIterator(
      { event: "fetch-emails", data: { count } },
      "fetched-emails",
    );

    for await (const email of iterator) {
      collected.push(email);
    }

    return collected;
  }

  /**
   * Returns an async iterator that yields any new incoming emails indefinitely
   * until the WebSocket closes or an error occurs.
   */
  public async *listenForNewEmails(): AsyncGenerator<GeneratorEmail> {
    // Use the same iterator, but without a stop condition (it will run until the socket is closed)
    yield* this.emailIterator({ event: "listen" });
  }
}
