import { getStorage, setStorage } from "@extension/utils/storage";
import browser from "webextension-polyfill";

export async function authenticateGoogle(
  data: {
    email: string;
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
  },
  sender: browser.Runtime.MessageSender,
) {
  const accounts = (await getStorage("accounts")) ?? [];

  accounts.push({
    type: "custom",
    email: data.email,
    credentials: {
      type: "IMAP" as const,
      host: data.host,
      port: data.port,
      user: data.user,
      password: data.password,
      secure: data.secure,
    },
  });

  await setStorage("accounts", accounts);
  if (sender.tab?.id) browser.tabs.remove(sender.tab.id);

  browser.tabs.create({
    url: chrome.runtime.getURL("index.html#/setup/complete"),
  });

  return { success: true };
}
