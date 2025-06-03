import { CustomAccount } from "@extension/background/accounts/providers/custom";
import { GoogleAccount } from "@extension/background/accounts/providers/google";
import { getStorage, setStorage } from "@extension/utils/storage";

const accounts: (GoogleAccount | CustomAccount)[] = [];

export async function addAccount(account: GoogleAccount | CustomAccount) {
  accounts.push(account);

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
      accounts.push(
        config.type === "google"
          ? new GoogleAccount(config)
          : new CustomAccount(config),
      );
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
