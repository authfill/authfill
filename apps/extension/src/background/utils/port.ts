import { readAccounts } from "@extension/background/accounts";
import { getActiveTab } from "@extension/background/utils/tab";
import browser from "webextension-polyfill";

export let ports: {
  id: string;
  port: browser.Runtime.Port;
  tab?: browser.Tabs.Tab;
}[] = [];

export async function connectPort(id: string, port: browser.Runtime.Port) {
  const tab = await getActiveTab();
  console.info(`[${id}] Port connected`);

  ports.push({
    id,
    port,
    tab,
    ...(tab && { tab }),
  });

  const accounts = await readAccounts();
  for (const account of accounts) {
    account.connect();
  }
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
