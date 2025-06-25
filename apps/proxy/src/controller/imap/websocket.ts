import { WebSocket } from "@cloudflare/workers-types";
import { handleEmailFetch, handleIdleListen } from "@proxy/handlers/websocket";
import { Env } from "@proxy/index";
import { checkIdleSupport, createImapConnection } from "@proxy/services/imap";
import { WebSocketMessage } from "@proxy/types";
import { CFImap } from "cf-imap";
import { Handler } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { WSContext } from "hono/ws";

export const handleImapWebSocket: Handler<{ Bindings: Env }, "/imap"> =
  upgradeWebSocket((c) => {
    let imap: CFImap | null = null;
    let isConnected = false;
    let isRealtime = false;

    return {
      async onMessage(event: any, ws: WSContext<WebSocket>) {
        try {
          const data = JSON.parse(event.data);

          switch (data.event) {
            case "connect":
              imap = createImapConnection(data.data);
              await imap.connect();
              isRealtime = await checkIdleSupport(imap);
              isConnected = true;

              const response: WebSocketMessage = {
                type: "log",
                status: "ok",
                realtimeSupport: isRealtime,
              };
              ws.send(JSON.stringify(response));
              break;

            case "listen":
              if (!isConnected || !imap || !isRealtime) {
                throw new Error("Not connected or realtime not supported");
              }
              await handleIdleListen(ws, imap);
              break;

            case "fetch-emails":
              if (!isConnected || !imap) {
                throw new Error("Not connected");
              }
              const emailCount = await handleEmailFetch(
                ws,
                imap,
                data.data.count || 3,
              );

              const fetchResponse: WebSocketMessage = {
                type: "log",
                status: "fetched-emails",
                message: `Fetched emails successfully (${emailCount} from ${data.data.count || 3})`,
              };
              ws.send(JSON.stringify(fetchResponse));
              break;
          }
        } catch (error: any) {
          const errorResponse: WebSocketMessage = {
            type: "log",
            status: "error",
            message: error.message,
          };
          ws.send(JSON.stringify(errorResponse));
        }
      },
      onClose() {
        if (isConnected && imap) {
          imap.logout();
        }
      },
    };
  });
