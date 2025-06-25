import { deleteAccount, listAccounts } from "@extension/background/accounts";
import { authenticateCustom } from "@extension/background/auth/custom";
import { startDemo } from "@extension/background/utils/demo";
import { getEmail } from "@extension/background/utils/email";
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
    case "accounts.delete":
      return await deleteAccount(payload.data);
    case "emails.get":
      return getEmail(payload.data);
    case "demo.start":
      return await startDemo();
  }

  return Promise.resolve({ success: false, error: "Unknown event" });
});
