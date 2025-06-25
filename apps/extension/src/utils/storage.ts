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

export type AccountConfig = CustomAccountConfig;

export interface Storage {
  accounts: AccountConfig[];
}

export function setStorage<T extends keyof Storage>(key: T, data: Storage[T]) {
  return browser.storage.local.set({ [key]: data });
}

export async function getStorage<T extends keyof Storage>(key: T) {
  const data = await browser.storage.local.get([key]);
  return data[key] as Storage[T];
}
