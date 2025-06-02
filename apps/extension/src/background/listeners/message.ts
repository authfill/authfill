import { listAccounts } from "@extension/background/accounts";
import { authenticateCustom } from "@extension/background/auth/custom";
import { showNotification } from "@extension/background/utils/notification";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(async (payload: any) => {
  switch (payload.event) {
    case "auth.custom":
      return await authenticateCustom(payload.data);
    case "notification.show":
      return await showNotification(payload.data);
    case "accounts.list":
      return await listAccounts();
  }

  return Promise.resolve({ success: false, error: "Unknown event" });
});
