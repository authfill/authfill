import {
  BaseProvider,
  GeneratorEmail,
} from "@extension/background/listener/providers/base";
import { CustomAccount } from "@extension/utils/storage";

export class ImapProvider extends BaseProvider {
  private account: CustomAccount;

  constructor(account: CustomAccount) {
    super();
    this.account = account;
  }

  async *listenForNewEmails() {
    console.log("Listening for new emails");
    // 1) Create the WebSocket
    const socket = new WebSocket("ws://localhost:4000/imap");

    // 2) Maintain an internal queue for incoming email events
    const pending: GeneratorEmail[] = [];
    //    Also keep a resolver for when the queue is empty
    let resolveNext: ((value: IteratorResult<GeneratorEmail>) => void) | null =
      null;

    // 3) Wrap the WebSocket's onmessage so that every email is pushed into `pending`
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log" && data.status === "ok") {
        socket.send(JSON.stringify({ event: "listen" }));
      }
      if (data.type === "email") {
        const email: GeneratorEmail = data.email;

        if (resolveNext) {
          // If someone is already waiting in the async* loop, fulfill it immediately
          resolveNext({ value: email, done: false });
          resolveNext = null;
        } else {
          // Otherwise, stash it in the queue
          pending.push(email);
        }
      }
    };

    // 4) Send the initial “connect” payload once the socket opens
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          event: "connect",
          data: {
            host: this.account.credentials.host,
            port: this.account.credentials.port,
            user: this.account.credentials.user,
            password: this.account.credentials.password,
            secure: this.account.credentials.secure,
          },
        }),
      );
    };

    // 5) Now loop forever (or until the socket closes) and yield from `pending`
    try {
      while (true) {
        if (pending.length > 0) {
          // If there's already something in the queue, yield it right away:
          const nextEmail = pending.shift()!;
          yield nextEmail;
        } else {
          // If the queue is empty, wait until onmessage pushes a new email
          const nextEmailPromise = new Promise<IteratorResult<GeneratorEmail>>(
            (resolve) => {
              resolveNext = resolve;
            },
          );
          const result = await nextEmailPromise;
          // When onmessage calls resolveNext, we get here and can yield:
          if (result.done) {
            // (Optional) if you ever want to break out
            return;
          } else {
            yield result.value;
          }
        }
      }
    } finally {
      // Clean up if the consumer cancels or if error happens
      socket.close();
    }
  }
}
