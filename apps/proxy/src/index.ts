import { exchangeGoogleCode } from "@proxy/controller/auth/google/exchange";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { testImapConnection } from "./controller/imap/test";
import { handleImapWebSocket } from "./controller/imap/websocket";

export type Env = {
  PUBLIC_WEB_URL: string;
  PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
};

type AppBindings = {
  Bindings: Env;
};

const app = new Hono<AppBindings>();

app.use("*", cors({ origin: "*" }));

app.post("/imap/test", testImapConnection);
app.post("/auth/google", exchangeGoogleCode);
app.get("/imap", handleImapWebSocket);

export default app;
