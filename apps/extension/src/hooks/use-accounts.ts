import { useBackground } from "@extension/hooks/use-background";
import { AccountConfig } from "@extension/utils/storage";
import { useQuery } from "@tanstack/react-query";

export function useAccounts() {
  const { sendToBackground } = useBackground();

  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await sendToBackground("accounts.list");
      return res.accounts as AccountConfig[];
    },
  });

  return { accounts: query.data, ...query };
}
