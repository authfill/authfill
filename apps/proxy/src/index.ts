import { Hono } from "hono";
import { cors } from "hono/cors";
import { testImapConnection } from "./controller/imap/test";
import { handleImapWebSocket } from "./controller/imap/websocket";

export type Env = {
  PUBLIC_WEB_URL: string;
};

export type AppBindings = {
  Bindings: Env;
};

const app = new Hono<AppBindings>();

app.use("*", cors({ origin: "*" }));

app.post("/imap/test", testImapConnection);
app.get("/imap", handleImapWebSocket);

export default app;
