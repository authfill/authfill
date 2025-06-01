import { getStorage, setStorage } from "@extension/utils/storage";
import browser from "webextension-polyfill";

export async function authenticateGoogle(
  data: {
    email: string;
    avatar: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  },
  sender: browser.Runtime.MessageSender,
) {
  const accounts = (await getStorage("accounts")) ?? [];

  accounts.push({
    type: "google",
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    credentials: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    },
  });

  await setStorage("accounts", accounts);
  if (sender.tab?.id) browser.tabs.remove(sender.tab.id);

  browser.tabs.create({
    url: chrome.runtime.getURL("index.html#/setup/complete"),
  });

  return { success: true };
}
