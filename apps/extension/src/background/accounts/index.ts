import { CustomAccount } from "@extension/background/accounts/providers/custom";
import { getStorage, setStorage } from "@extension/utils/storage";

let accounts: CustomAccount[] = [];

export async function addAccount(account: CustomAccount) {
  accounts = await readAccounts();

  accounts.push(account);

  await setStorage(
    "accounts",
    accounts.map((a) => a.toConfig()),
  );
}

export async function syncAccounts() {
  await setStorage(
    "accounts",
    accounts.map((a) => a.toConfig()),
  );
}

export async function readAccounts() {
  const configs = (await getStorage("accounts")) ?? [];

  for (const config of configs) {
    const index = accounts.findIndex((a) => a.config.id === config.id);

    if (index !== -1) {
      accounts[index].config = config;
    } else {
      accounts.push(new CustomAccount(config));
    }
  }

  return accounts;
}

export async function listAccounts() {
  const accounts = await readAccounts();

  return {
    accounts: accounts.map((account) => {
      const config = account.toConfig();

      return {
        ...config,
        credentials: {
          ...config.credentials,
          password: undefined,
        },
      };
    }),
  };
}

export async function deleteAccount({ accountId }: { accountId: string }) {
  accounts = await readAccounts();

  const account = accounts.find((a) => a.config.id === accountId);
  if (!account) return { success: false, error: "Account not found" };
  await account.disconnect();

  accounts = accounts.filter((a) => a.config.id !== accountId);

  await setStorage(
    "accounts",
    accounts.map((a) => a.toConfig()),
  );

  return { success: true };
}
