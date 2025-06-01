import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import Imap from "imap";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/imap",
  upgradeWebSocket((c) => {
    const imap = new Imap({
      user: c.req.header("IMAP-Username")!,
      password: c.req.header("IMAP-Password")!,
      host: c.req.header("IMAP-Host"),
      port: 993,
      tls: true,
      tlsOptions: {
        port: 143,
      },
    });

    imap.once("ready", function () {
      console.log("IMAP ready");

      imap.openBox("INBOX", true, (err, box) => {
        if (err) {
          console.log(err);
          return;
        }

        const f = imap.seq.fetch("1:3", {
          bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
          struct: true,
        });

        f.on("message", function (msg, seqno) {
          console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function (stream, info) {
            var buffer = "";
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });
            stream.once("end", function () {
              console.log(
                prefix + "Parsed header: %s",
                Imap.parseHeader(buffer),
              );
            });
          });

          msg.once("attributes", function (attrs) {
            console.log(prefix + "Attributes: %s", attrs, false, 8);
          });

          msg.once("end", function () {
            console.log(prefix + "Finished");
          });
        });

        f.once("error", function (err) {
          console.log("Fetch error: " + err);
        });

        f.once("end", function () {
          console.log("Done fetching all messages!");
          imap.end();
        });
      });
    });

    imap.once("error", function (err: any) {
      console.log(err);
    });

    imap.once("end", function () {
      console.log("Connection ended");
    });

    imap.connect();

    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send("Hello from server!");
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

export default app;
