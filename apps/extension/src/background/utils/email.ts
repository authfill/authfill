import { Port, ports } from "@extension/background/utils/port";
import { hasValidUrl } from "@extension/background/utils/tab";
import { Email, EmailBase } from "@extension/types/email";
import { id } from "@extension/utils/id";
import { extractLink } from "@extension/utils/link-parser";
import { extractOTPCode } from "@extension/utils/otp-parser";
import { htmlToText } from "html-to-text";

export let emailCache: Email[] = [];

export function addEmails(emails: EmailBase[], accountId: string) {
  for (const emailBase of emails) {
    const email: Email = { ...emailBase, id: id("mail"), accountId };

    const link = extractLink(
      email.text ? email.text : email.html ? htmlToText(email.html) : "",
    );
    if (link) email.link = link;

    const otp = extractOTPCode(
      email.text ? email.text : email.html ? htmlToText(email.html) : "",
    );
    if (otp) email.otp = otp;

    emailCache.push(email);
  }

  emailCache = emailCache.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  for (const port of ports) {
    syncEmailsToPort(port);
  }
}

export function syncEmailsToPort(port: Port) {
  const emails = getEmailsForPort(port);

  port.runtime.postMessage({
    event: "emails.update",
    data: { emails },
  });
}

export function getEmailsForPort(port: Port) {
  if (!port.tab || !hasValidUrl(port.tab)) return [];

  const url = new URL(port.tab.url!);
  const domain = url.hostname.split(".").slice(-2).join(".");
  const emails = emailCache.filter((email) => email.from.includes(domain));

  return emails;
}

export function clearEmailCache() {
  emailCache = [];
}

export function getEmail({ emailId }: { emailId: string }) {
  console.log("getEmail", emailId);
  return {
    email: emailCache.find((email) => email.id === emailId),
  };
}
