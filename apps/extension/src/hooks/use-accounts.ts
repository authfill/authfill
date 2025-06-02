import { useBackground } from "@extension/hooks/use-background";
import { useQuery } from "@tanstack/react-query";

export function useAccounts() {
  const { sendToBackground } = useBackground();

  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await sendToBackground("accounts.list");
      return res.accounts;
    },
  });

  return { accounts: query.data, ...query };
}
