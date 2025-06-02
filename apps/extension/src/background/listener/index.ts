import { GoogleProvider } from "@extension/background/listener/providers/google";
import { ImapProvider } from "@extension/background/listener/providers/imap";
import { extractSecretCode } from "@extension/utils/otp-parser";
import {
  CustomAccount,
  getStorage,
  GoogleAccount,
} from "@extension/utils/storage";
import { htmlToText } from "html-to-text";
import browser from "webextension-polyfill";

export async function startListener(popupId: string) {
  const accounts = await getStorage("accounts");
  const tabs = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tabs.length) {
    return { error: "TAB_NOT_FOUND" };
  }
  const tab = tabs[0];

  const url = new URL(tab.url || "");
  console.log(url.protocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    return { error: "TAB_NOT_SUPPORTED" };
  }

  for (const account of accounts) {
    if (account.type === "custom") {
      (async () => {
        const provider = new ImapProvider(account as CustomAccount);
        const last3Messages = await provider.getLatestEmails(3);
        console.log("[IMAP] Last 3 emails", last3Messages);

        for (const message of last3Messages) {
          const secretCode = extractSecretCode(
            message.text ? message.text : htmlToText(message.html),
          );
          if (secretCode) {
            browser.runtime.sendMessage(undefined, {
              event: "listener.result",
              popupId: popupId,
              data: { code: secretCode },
            });
            return;
          }
        }

        console.log("[IMAP] Listening for new emails");

        for await (const email of provider.listenForNewEmails()) {
          console.log("[IMAP] New email received", email);
          const secretCode = extractSecretCode(
            email.text ? email.text : htmlToText(email.html),
          );
          if (secretCode) {
            browser.runtime.sendMessage(undefined, {
              event: "listener.result",
              popupId: popupId,
              data: { code: secretCode },
            });
            return;
          }
        }
      })();
    } else if (account.type === "google") {
      (async () => {
        const googleProvider = new GoogleProvider(account as GoogleAccount);
        const last3Messages = await googleProvider.getLatestEmails(3);

        for (const message of last3Messages) {
          const secretCode = extractSecretCode(message.text);
          if (secretCode) {
            browser.runtime.sendMessage(undefined, {
              event: "listener.result",
              popupId: popupId,
              data: { code: secretCode },
            });
            return;
          }
        }

        for await (const email of googleProvider.listenForNewEmails()) {
          const secretCode = extractSecretCode(email.text);
          if (secretCode) {
            browser.runtime.sendMessage(undefined, {
              event: "listener.result",
              popupId: popupId,
              data: { code: secretCode },
            });
            return;
          }
        }
      })();
    }
  }

  return { status: "WAITING_FOR_OTP" };
}
