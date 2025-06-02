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

  for (const account of accounts) {
    if (account.type === "custom") {
      (async () => {
        const provider = new ImapProvider(account as CustomAccount);
        const last3Messages = await provider.getLatestEmails(3);

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
