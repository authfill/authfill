export type Env = {
  PUBLIC_WEB_URL: string;
  PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
};

export type Bindings = {
  Bindings: Env;
};

export interface EmailResponse {
  subject: string;
  to: string;
  from: string;
  text: string | null;
  html: string | null;
  date: string | null;
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface WebSocketMessage {
  type: "email";
  email: EmailResponse;
}
