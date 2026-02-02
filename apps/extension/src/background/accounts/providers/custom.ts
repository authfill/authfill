import { generateOTP } from "@extension/background/utils/demo";
import { addEmails } from "@extension/background/utils/email";
import { Email } from "@extension/types/email";
import { CustomAccountConfig, getStorage, getProxyUrls } from "@extension/utils/storage";

type ConnectPayload = {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
};

type OutgoingEvent = { event: "connect"; data: ConnectPayload };

async function getProxyWssUrl(): Promise<string> {
  const settings = await getStorage("proxySettings");
  if (settings?.enabled && settings.baseUrl) {
    return getProxyUrls(settings.baseUrl).wssUrl;
  }
  return import.meta.env.PUBLIC_WSS_URL;
}

export class CustomAccount {
  config: CustomAccountConfig;
  private ws: WebSocket | null = null;

  constructor(account: CustomAccountConfig) {
    this.config = account;
  }

  public async connect() {
    if (this.config.email === "test@authfill.com") {
      console.info(`[${this.config.id}] Test account detected`);

      const otp = generateOTP();

      addEmails(
        [
          {
            from: "Test Sender <sender@authfill.com>",
            subject: `Your verification code is ${otp}`,
            html: `Dear Test User,\n\nYour verification code is ${otp}\n\nBest Regards,\nAuthFill`,
            date: new Date().toISOString(),
            to: this.config.email,
            alwaysShow: true,
            otp,
          },
        ],
        this.config.id,
      );
      return;
    }

    if (this.ws) {
      console.warn(`[${this.config.id}] Account already connected`);
      return;
    }

    const wssUrl = await getProxyWssUrl();
    this.ws = new WebSocket(`${wssUrl}/imap`);

    this.ws.addEventListener("open", () => {
      if (!this.ws) return;

      const payload: OutgoingEvent = {
        event: "connect",
        data: {
          host: this.config.credentials.host,
          port: this.config.credentials.port,
          user: this.config.credentials.user,
          password: this.config.credentials.password,
          secure: this.config.credentials.secure,
        },
      };
      this.ws.send(JSON.stringify(payload));
      console.info(`[${this.config.id}] Account connected`);
    });

    this.ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "email") {
        const email: Email = data.email;
        addEmails([email], this.config.id);
      }
    });

    this.ws.addEventListener("error", (err) => {
      console.error(`[${this.config.id}] WebSocket error:`, err);
    });

    this.ws.addEventListener("close", () => {
      console.info(`[${this.config.id}] WebSocket closed`);
      this.ws = null;
    });
  }

  public disconnect() {
    if (!this.ws) {
      console.warn(`[${this.config.id}] Account already disconnected`);
      return;
    }

    this.ws.close();
    this.ws = null;

    console.info(`[${this.config.id}] Account disconnected`);
  }

  public toConfig() {
    return this.config;
  }
}
