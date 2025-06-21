import { readAccounts } from "@extension/background/accounts";
import { clearEmailCache } from "@extension/background/utils/email";
import { getActiveTab } from "@extension/background/utils/tab";
import browser from "webextension-polyfill";

export type Port = {
  id: string;
  runtime: browser.Runtime.Port;
  tab?: browser.Tabs.Tab;
};

export let ports: Port[] = [];

export async function connectPort(id: string, runtime: browser.Runtime.Port) {
  const tab = await getActiveTab();
  console.info(`[${id}] Port connected`);

  const port = {
    id,
    tab,
    runtime,
    ...(tab && { tab }),
  };

  if (ports.length === 0) clearEmailCache();
  ports.push(port);

  const accounts = await readAccounts();
  for (const account of accounts) {
    account.connect();
  }

  browser.runtime.sendMessage({ event: "popup.opened" });

  return port;
}

export async function disconnectPort(id: string) {
  ports = ports.filter((port) => port.id !== id);
  console.info(`[${id}] Port disconnected`);

  if (ports.length !== 0) return;

  const accounts = await readAccounts();
  for (const account of accounts) {
    account.disconnect();
  }
}
