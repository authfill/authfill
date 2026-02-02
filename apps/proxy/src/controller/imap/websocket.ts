import { WebSocket } from "@cloudflare/workers-types";
import { handleEmailFetch, handleIdleListen } from "@proxy/handlers/websocket";
import { Env } from "@proxy/index";
import { checkIdleSupport, createImapConnection } from "@proxy/services/imap";
import { CFImap } from "cf-imap";
import { Handler } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { WSContext } from "hono/ws";

export const handleImapWebSocket: Handler<{ Bindings: Env }, "/imap"> =
  upgradeWebSocket((c) => {
    let imap: CFImap | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    return {
      async onMessage(event: any, ws: WSContext<WebSocket>) {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "connect") {
            imap = createImapConnection(data.data);
            await imap.connect();
            const isRealtime = await checkIdleSupport(imap);

            // Fetch initial emails
            await handleEmailFetch(ws, imap, 10);

            if (isRealtime) {
              // Use IDLE for real-time listening
              await handleIdleListen(ws, imap);
            } else {
              // Poll every 3 seconds for latest 3 emails
              pollInterval = setInterval(async () => {
                if (imap) {
                  await handleEmailFetch(ws, imap, 3);
                }
              }, 3000);
            }
          }
        } catch (error: any) {
          ws.close(1011, error.message);
        }
      },
      onClose() {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        if (imap) {
          imap.logout();
        }
      },
    };
  });
