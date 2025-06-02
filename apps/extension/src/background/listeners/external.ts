import { authenticateGoogle } from "@extension/background/auth/google";
import browser from "webextension-polyfill";

browser.runtime.onMessageExternal.addListener(
  async (payload: any, sender: browser.Runtime.MessageSender) => {
    // TODO: Check sender origin(?)

    switch (payload.event) {
      case "auth.google":
        return await authenticateGoogle(payload.data, sender);
    }

    return Promise.resolve({ success: false, error: "Unknown event" });
  },
);
