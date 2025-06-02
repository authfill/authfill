import { getStorage } from "@extension/utils/storage";

export async function listAccounts() {
  const accounts = (await getStorage("accounts")) ?? [];
  return {
    accounts: accounts.map((account) => {
      return {
        ...account,
        credentials: {
          ...account.credentials,
          password: undefined,
        },
      };
    }),
  };
}
