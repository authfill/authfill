import { ImapProvider } from "@extension/background/listener/providers/imap";
import { extractSecretCode } from "@extension/utils/otp-parser";
import { CustomAccount, getStorage } from "@extension/utils/storage";
import { htmlToText } from "html-to-text";
import browser from "webextension-polyfill";

export async function startListener(sender: browser.Runtime.MessageSender) {
  const accounts = await getStorage("accounts");
  for (const account of accounts) {
    console.log(account);
    if (account.type === "custom") {
      (async () => {
        const provider = new ImapProvider(account as CustomAccount);
        for await (const email of provider.listenForNewEmails()) {
          console.log("new email", email);
          const secretCode = extractSecretCode(
            email.text ? email.text : htmlToText(email.html),
          );

          console.log("secret code", secretCode);
        }
      })();
    }
  }

  return { status: "WAITING_FOR_OTP" };
}
