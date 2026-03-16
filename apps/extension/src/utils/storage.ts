import browser from "webextension-polyfill";

export interface BaseAccountConfig {
  id: string;
  email: string;
}

export interface CustomAccountConfig extends BaseAccountConfig {
  type: "custom";
  credentials: {
    type: "IMAP";
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
  };
}

export interface MicroslopAccountConfig extends BaseAccountConfig {
  type: "microslop";
  credentials: {
    type: "OAUTH2";
    clientId: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
  };
}

export type AccountConfig = CustomAccountConfig | MicroslopAccountConfig;

export interface ProxySettings {
  enabled: boolean;
  baseUrl: string;
}

export interface Storage {
  accounts: AccountConfig[];
  proxySettings?: ProxySettings;
}

export function getProxyUrls(baseUrl: string): {
  httpUrl: string;
  wssUrl: string;
} {
  const url = new URL(baseUrl);
  const httpUrl = baseUrl.replace(/\/$/, "");
  const wssUrl = `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}${url.pathname.replace(/\/$/, "")}`;
  return { httpUrl, wssUrl };
}

export function setStorage<T extends keyof Storage>(key: T, data: Storage[T]) {
  return browser.storage.local.set({ [key]: data });
}

export async function getStorage<T extends keyof Storage>(key: T) {
  const data = await browser.storage.local.get([key]);
  return data[key] as Storage[T];
}
