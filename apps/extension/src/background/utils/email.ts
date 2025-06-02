import { ports } from "@extension/background/utils/port";
import { hasValidUrl } from "@extension/background/utils/tab";
import { Email } from "@extension/types/email";
import { extractOTPCode } from "@extension/utils/otp-parser";
import { htmlToText } from "html-to-text";

export async function checkEmails(emails: Email[]) {
  if (emails.length === 0) return;

  for (const port of ports) {
    if (!port.tab) continue;

    if (!(await hasValidUrl(port.tab))) continue;
    const url = new URL(port.tab.url!);
    const domain = url.hostname.split(".").slice(-2).join(".");

    for (const email of emails) {
      // TODO: Improve this check
      if (!email.from.includes(domain)) continue;

      const secretCode = extractOTPCode(
        email.text ? email.text : email.html ? htmlToText(email.html) : "",
      );
      if (secretCode) {
        port.port.postMessage({
          event: "otp.result",
          data: { code: secretCode },
        });

        break;
      }
    }
  }
}
