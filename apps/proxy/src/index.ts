import { exchangeGoogleCode } from "@proxy/controller/auth/google/exchange";
import { CFImap } from "cf-imap";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { decodeQuotedPrintable } from "./utils/decode-quoted-printable";
import { stripEmail } from "./utils/email-formatter";

export type Env = {
  PUBLIC_WEB_URL: string;
  PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
};

export type Bindings = {
  Bindings: Env;
};

const app = new Hono<Bindings>();

app.use("*", async (c, next) => {
  return cors({
    origin: c.env.PUBLIC_WEB_URL,
  })(c, next);
});

app.get("/", (c) => {
  return c.text("We love AuthFill!");
});

app.post("/imap/test", async (c) => {
  const data = await c.req.json();

  const imap = new CFImap({
    host: data.host,
    port: data.port,
    tls: data.secure,
    auth: {
      username: data.user,
      password: data.password,
    },
  });

  try {
    await imap.connect();
    await imap.logout();
    return c.json({ success: true });
  } catch (e: any) {
    console.log("Error connecting to IMAP", e.message);
    return c.json(
      { error: "Error connecting to IMAP", message: e.message },
      400,
    );
  }
});

app.post("/auth/google", exchangeGoogleCode);

app.get(
  "/imap",
  upgradeWebSocket(async (c) => {
    let imap: CFImap | null = null;
    let isConnected = false;
    let isRealtime = false;

    return {
      async onMessage(event, ws) {
        const data = JSON.parse(event.data);

        if (data.event === "connect") {
          imap = new CFImap({
            host: data.data.host,
            port: data.data.port,
            tls: data.data.secure,
            auth: {
              username: data.data.user,
              password: data.data.password,
            },
          });

          try {
            await imap.connect();
          } catch (e) {
            console.log("Error connecting to IMAP", e);
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "Error connecting to IMAP",
              }),
            );
            return;
          }
          // check IDLE support
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          await imap.writer?.write(
            encoder.encode("AUTHFILLINIT CAPABILITY\r\n"),
          );
          const imapData = await imap.reader?.read();
          const decoded = imapData?.value ? decoder.decode(imapData.value) : "";
          isConnected = true;
          isRealtime = decoded.split(" ").includes("IDLE");

          ws.send(
            JSON.stringify({
              type: "log",
              status: "ok",
              realtimeSupport: isRealtime,
            }),
          );
          return;
        }

        if (data.event == "listen") {
          if (!isConnected || !imap) {
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "Not connected",
              }),
            );
            return;
          }
          if (!isRealtime) {
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "Not connected",
              }),
            );
            return;
          }
          while (true) {
            await imap.selectFolder("INBOX");
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            await imap.writer?.write(encoder.encode("AUTHFILLIDLE IDLE\r\n"));
            const data = await imap.reader?.read();
            const decoded = data?.value ? decoder.decode(data.value) : "";
            if (decoded.includes("idling")) {
              ws.send(JSON.stringify({ status: "ok", revd: decoded }));
              const newEmailData = await imap.reader?.read();
              const newEmail = newEmailData?.value
                ? decoder.decode(newEmailData.value)
                : "";
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
                    console.log("Found new email", match[1]);
                    console.log(mail);
                    const stripped = stripEmail(mail.raw);
                    console.log(stripped);
                    ws.send(
                      JSON.stringify({
                        type: "email",
                        email: {
                          subject: mail.subject,
                          to: mail.to,
                          from: mail.from,
                          text: stripped.plain
                            ? decodeQuotedPrintable(stripped.plain)
                            : null,
                          html: stripped.html
                            ? decodeQuotedPrintable(stripped.html)
                            : null,
                        },
                      }),
                    );
                  }
                } catch (e) {
                  console.log("Error fetching email", e);
                }
              } else {
                continue;
              }
            } else {
              ws.send(
                JSON.stringify({ status: "error", message: "Idling failed" }),
              );
            }
          }
        }
        if (data.event == "fetch-emails") {
          if (!isConnected || !imap) {
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "Not connected",
              }),
            );
            return;
          }

          const count = data.data.count || 3;

          const folder = await imap.selectFolder("INBOX");
          const totalEmailCount = folder["emails"];

          if (!totalEmailCount) {
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "No email key found while fetching emails",
              }),
            );
            return;
          }
          if (totalEmailCount < count) {
            ws.send(
              JSON.stringify({
                type: "log",
                status: "error",
                message: "Not enough emails in the folder",
              }),
            );
            return;
          }

          const emails = await imap.fetchEmails({
            limit: [totalEmailCount - count + 1, totalEmailCount],
            folder: "INBOX",
            fetchBody: true,
          });

          for (const email of emails) {
            try {
              const stripped = stripEmail(email.raw);
              console.log("sending", stripped);
              ws.send(
                JSON.stringify({
                  type: "email",
                  email: {
                    subject: email.subject,
                    to: email.to,
                    from: email.from,
                    text: stripped.plain
                      ? decodeQuotedPrintable(stripped.plain)
                      : null,
                    html: stripped.html
                      ? decodeQuotedPrintable(stripped.html)
                      : null,
                  },
                }),
              );
            } catch (e) {
              console.log("Error stripping email", e);
              continue;
            }
          }
        }
      },
      onClose: () => {
        if (isConnected) {
          if (imap) {
            imap.logout();
          }
        }
      },
    };
  }),
);

export default app;
