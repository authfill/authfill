import browser from "webextension-polyfill";

export interface Storage {
  accounts: (
    | {
        type: "google";
        email: string;
        name?: string;
        avatar?: string;
        credentials: {
          accessToken: string;
          refreshToken: string;
          expiresAt: number;
        };
      }
    | {
        type: "custom";
        email: string;
        credentials: {
          type: "IMAP";
          host: string;
          port: number;
          user: string;
          password: string;
          secure: boolean;
        };
      }
  )[];
}

export function setStorage<T extends keyof Storage>(key: T, data: Storage[T]) {
  return browser.storage.local.set({ [key]: data });
}

export async function getStorage<T extends keyof Storage>(key: T) {
  const data = await browser.storage.local.get([key]);
  return data[key] as Storage[T];
}
