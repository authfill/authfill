import { CFImap } from "cf-imap";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";

const app = new Hono();

app.get("/", (c) => {
  return c.text("We love AuthFill!");
});

app.get(
  "/imap",
  upgradeWebSocket(async (c) => {
    let imap = new CFImap({
      host: c.req.header("IMAP-Host")!,
      port: Number(c.req.header("IMAP-Port")!),
      tls: c.req.header("IMAP-Secure") === "true",
      auth: {
        username: c.req.header("IMAP-User")!,
        password: c.req.header("IMAP-Password")!,
      },
    });

    let isConnected = false;
    let isRealtime = false;

    return {
      async onMessage(event, ws) {
        async function connect() {
          await imap.connect();
          // check IDLE support
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          await imap.writer?.write(
            encoder.encode("AUTHFILLINIT CAPABILITY\r\n"),
          );
          const data = await imap.reader?.read();
          const decoded = data?.value ? decoder.decode(data.value) : "";
          isConnected = true;
          isRealtime = decoded.split(" ").includes("IDLE");

          ws.send(
            JSON.stringify({
              status: "ok",
              realtimeSupport: isRealtime,
            }),
          );
        }
        if (event.data === "connect") {
          connect();
          return;
        }

        if (event.data == "listen") {
          if (!isConnected) {
            ws.send(
              JSON.stringify({ status: "error", message: "Not connected" }),
            );
            return;
          }
          if (!isRealtime) {
            ws.send(
              JSON.stringify({ status: "error", message: "Not connected" }),
            );
            return;
          }
          while (true) {
            if (!isConnected) await connect();
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
                console.log("Found new email", match[1]);
                await imap.writer?.write(encoder.encode("DONE\r\n"));
                await imap.selectFolder("INBOX");
                try {
                  const mail = await imap.fetchEmails({
                    limit: [Number(match[1]), Number(match[1])],
                    folder: "INBOX",
                    fetchBody: true,
                  });
                  const rightMail = mail[mail.length - 1];
                  ws.send(
                    JSON.stringify({
                      status: "new-emails",
                      email: rightMail,
                      id: match[1],
                    }),
                  );
                } catch (e) {
                  console.log("Error fetching email", e);
                }
              } else {
                console.log("Could not parse ", newEmail);
                continue;
              }
            } else {
              ws.send(
                JSON.stringify({ status: "error", message: "Idling failed" }),
              );
            }
          }
        }
      },
      onClose: () => {
        if (isConnected) {
          imap.logout();
        }
      },
    };
  }),
);

export default app;
