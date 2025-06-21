export type EmailBase = {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  date: string;
  demo?: boolean;
  otp?: string;
};

export type Email = EmailBase & {
  id: string;
  accountId: string;
  link?: string;
  otp?: string;
};
