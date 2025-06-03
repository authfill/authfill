import { addAccount } from "@extension/background/accounts";
import { GoogleAccount } from "@extension/background/accounts/providers/google";
import { id } from "@extension/utils/id";
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
  await addAccount(
    new GoogleAccount({
      id: id("acc"),
      type: "google",
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      credentials: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      },
    }),
  );

  if (sender.tab?.id) browser.tabs.remove(sender.tab.id);

  browser.tabs.create({
    url: browser.runtime.getURL("index.html#/setup/complete"),
  });

  return { success: true };
}
