import { addAccount, listAccounts } from "@extension/background/accounts";
import { CustomAccount } from "@extension/background/accounts/providers/custom";
import { id } from "@extension/utils/id";
import { getStorage, getProxyUrls } from "@extension/utils/storage";
import axios from "axios";

async function getProxyHttpUrl(): Promise<string> {
  const settings = await getStorage("proxySettings");
  if (settings?.enabled && settings.baseUrl) {
    return getProxyUrls(settings.baseUrl).httpUrl;
  }
  return import.meta.env.PUBLIC_PROXY_URL;
}

export async function authenticateCustom(data: {
  email: string;
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
}) {
  const accounts = await listAccounts();
  if (accounts.accounts.find((a) => a.email === data.email))
    return {
      success: false,
      error: "This email is already connected.",
    };

  if (data.email !== "test@authfill.com")
    try {
      const proxyUrl = await getProxyHttpUrl();
      const res = await axios.post(`${proxyUrl}/imap/test`, {
        host: data.host,
        port: data.port,
        user: data.user,
        secure: data.secure,
        password: data.password,
      });

      if (!res.data.success)
        return {
          success: false,
          error: "Connection failed! Please check your credentials.",
        };
    } catch {
      return {
        success: false,
        error: "Connection failed! Please check your credentials.",
      };
    }

  await addAccount(
    new CustomAccount({
      id: id("acc"),
      type: "custom",
      email: data.email,
      credentials: {
        type: "IMAP",
        host: data.host,
        port: data.port,
        user: data.user,
        password: data.password,
        secure: data.secure,
      },
    }),
  );

  const updatedAccounts = await listAccounts();
  return { success: true, count: updatedAccounts.accounts.length };
}
