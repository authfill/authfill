import { authenticateCustom } from "@extension/background/auth/custom";
import { authenticateGoogle } from "@extension/background/auth/google";
import { startListener } from "@extension/background/listener";
import browser from "webextension-polyfill";

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.tabs.create({
      url: chrome.runtime.getURL("index.html#/setup"),
    });
  }
});

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

browser.runtime.onMessage.addListener(async (payload: any) => {
  switch (payload.event) {
    case "listener.start":
      return await startListener(payload.data);
    case "auth.custom":
      return await authenticateCustom(payload.data);
  }

  return Promise.resolve({ success: false, error: "Unknown event" });
});
