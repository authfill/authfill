import { deleteAccount, listAccounts } from "@extension/background/accounts";
import { authenticateCustom } from "@extension/background/auth/custom";
import { startDemo } from "@extension/background/utils/demo";
import { getEmail } from "@extension/background/utils/email";
import { showNotification } from "@extension/background/utils/notification";
import {
  getStorage,
  setStorage,
  getProxyUrls,
  type ProxySettings,
} from "@extension/utils/storage";
import axios from "axios";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(async (payload: any) => {
  switch (payload.event) {
    case "auth.custom":
      return await authenticateCustom(payload.data);
    case "notification.show":
      return await showNotification(payload.data);
    case "accounts.list":
      return await listAccounts();
    case "accounts.delete":
      return await deleteAccount(payload.data);
    case "emails.get":
      return getEmail(payload.data);
    case "demo.start":
      return await startDemo();
    case "settings.get":
      return await getProxySettings();
    case "settings.set":
      return await setProxySettings(payload.data);
    case "settings.testProxy":
      return await testProxyConnection(payload.data);
  }

  return Promise.resolve({ success: false, error: "Unknown event" });
});

async function getProxySettings(): Promise<ProxySettings> {
  const settings = await getStorage("proxySettings");
  return settings ?? { enabled: false, baseUrl: "" };
}

async function setProxySettings(
  settings: ProxySettings,
): Promise<{ success: boolean }> {
  await setStorage("proxySettings", settings);
  return { success: true };
}

async function testProxyConnection(data: {
  baseUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { httpUrl } = getProxyUrls(data.baseUrl);
    const res = await axios.get(`${httpUrl}/health`, { timeout: 5000 });
    if (res.status === 200 && res.data?.status === "ok") {
      return { success: true };
    }
    return { success: false, error: "Unexpected response from proxy" };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return { success: false, error: "Connection timed out" };
      }
      if (error.response) {
        return {
          success: false,
          error: `Server error: ${error.response.status}`,
        };
      }
      if (error.request) {
        return { success: false, error: "No response from server" };
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
