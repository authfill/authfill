import { Port, ports } from "@extension/background/utils/port";
import { Email, EmailBase } from "@extension/types/email";
import { extractAuthCandidates } from "@extension/utils/detection";
import { id } from "@extension/utils/id";

export let emailCache: Email[] = [];

export function addEmails(emails: EmailBase[], accountId: string) {
  for (const emailBase of emails) {
    const email: Email = { ...emailBase, id: id("mail"), accountId };

    if (!email.demo) {
      const candidates = extractAuthCandidates({
        html: emailBase.html,
        text: emailBase.text,
        subject: emailBase.subject,
      });

      if (candidates.length) {
        const topScorer = candidates[0];

        // TODO: add null check and threshold

        if (topScorer.type === "link") {
          email.link = topScorer.value;
        } else if (topScorer.type === "code") {
          email.otp = topScorer.value;
        }
      }
    }

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
  if (!port.tab) return [];

  const url = new URL(port.tab.url!);
  const domain = url.hostname?.split(".").slice(-2).join(".");
  const emails = emailCache.filter(
    (email) => email.demo || (domain && email.from.includes(domain)),
  );

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
