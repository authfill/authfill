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
    let isIdling = false;

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
              isIdling = true;
              ws.send(JSON.stringify({ status: "ok", revd: decoded }));
              const newEmailData = await imap.reader?.read();
              const newEmail = newEmailData?.value
                ? decoder.decode(newEmailData.value)
                : "";
              const regex = /.*\* ([0-9]+) EXISTS.*/g;
              const match = regex.exec(newEmail);
              if (match) {
                console.log("Found new email", match[1]);
                await imap.logout();
                console.log("Logged out");
                // Reset socket to fix the IDLE bug
                // TODO: Fix this and find a better solution instead of a full reconnect
                // @ts-ignore
                imap = null;
                imap = new CFImap({
                  host: c.req.header("IMAP-Host")!,
                  port: Number(c.req.header("IMAP-Port")!),
                  tls: c.req.header("IMAP-Secure") === "true",
                  auth: {
                    username: c.req.header("IMAP-User")!,
                    password: c.req.header("IMAP-Password")!,
                  },
                });
                await imap.connect();
                await imap.selectFolder("INBOX");
                try {
                  const mail = await imap.fetchEmails({
                    limit: [Number(match[1]) - 1, Number(match[1]) - 1],
                    folder: "INBOX",
                    fetchBody: true,
                  });
                  ws.send(
                    JSON.stringify({
                      status: "new-emails",
                      email: mail,
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
              isIdling = false;
              ws.send(
                JSON.stringify({ status: "error", message: "Idling failed" }),
              );
            }
          }
        }

        if (event.data === "get-new-emails") {
          if (!isConnected) {
            ws.send(
              JSON.stringify({ status: "error", message: "Not connected" }),
            );
            return;
          }
          if (isIdling) {
            ws.send(
              JSON.stringify({ status: "error", message: "Idling is ongoing" }),
            );
            return;
          }
          await imap.selectFolder("INBOX");
          const sentSince = new Date();
          sentSince.setMinutes(sentSince.getMinutes() - 10);
          console.log(sentSince);
          let searchedEmails = await imap.searchEmails({
            deleted: false,
            since: sentSince,
          });
          for (const email of searchedEmails) {
            const e = await imap.fetchEmails({
              limit: [email, email],
              folder: "INBOX",
              fetchBody: true,
            });
            ws.send(JSON.stringify(e));
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
