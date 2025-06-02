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

export async function startListener(data: { popupId: string }) {
  const accounts = await getStorage("accounts");

  for (const account of accounts) {
    if (account.type === "custom") {
      (async () => {
        const provider = new ImapProvider(account as CustomAccount);
        for await (const email of provider.listenForNewEmails()) {
          console.log("new email", email);
          const secretCode = extractSecretCode(
            email.text ? email.text : htmlToText(email.html),
          );

          browser.runtime.sendMessage(undefined, {
            event: "listener.result",
            popupId: data.popupId,
            data: { code: secretCode },
          });
        }
      })();
    } else if (account.type === "google") {
      (async () => {
        const googleProvider = new GoogleProvider(account as GoogleAccount);
        const last3Messages = await googleProvider.getLatestEmails(3);

        for (const message of last3Messages) {
          const secretCode = extractSecretCode(message.text);

          browser.runtime.sendMessage(undefined, {
            event: "listener.result",
            popupId: data.popupId,
            data: { code: secretCode },
          });
        }
      })();
    }
  }

  return { status: "WAITING_FOR_OTP" };
}
