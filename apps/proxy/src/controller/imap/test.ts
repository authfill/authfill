import { Handler } from "hono";
import { Env } from "@proxy/index";
import { createImapConnection } from "@proxy/services/imap";

export const testImapConnection: Handler<{ Bindings: Env }, "/imap/test"> = async (c) => {
  const data = await c.req.json();
  const imap = createImapConnection(data);

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
}; 