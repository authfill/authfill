import { CFImap } from "cf-imap";
import { EmailResponse, ImapConfig } from "../types";
import { decodeQuotedPrintable } from "../utils/decode-quoted-printable";
import { stripEmail } from "../utils/email-formatter";

export const createImapConnection = (config: ImapConfig) => {
  return new CFImap({
    host: config.host,
    port: config.port,
    tls: config.secure,
    auth: {
      username: config.user,
      password: config.password,
    },
  });
};

export const checkIdleSupport = async (imap: CFImap): Promise<boolean> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  await imap.writer?.write(encoder.encode("AUTHFILLINIT CAPABILITY\r\n"));
  const imapData = await imap.reader?.read();
  const decoded = imapData?.value ? decoder.decode(imapData.value) : "";
  return decoded.split(" ").includes("IDLE");
};

export const processEmail = (mail: any): EmailResponse => {
  const stripped = stripEmail(mail.raw);
  return {
    subject: mail.subject,
    to: mail.to,
    from: mail.from,
    text: stripped.plain ? decodeQuotedPrintable(stripped.plain) : null,
    html: stripped.html ? decodeQuotedPrintable(stripped.html) : null,
    date: mail.date.toISOString(),
  };
};
