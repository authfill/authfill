import { useBackground } from "@extension/hooks/use-background";
import { Email } from "@extension/types/email";
import { useQuery } from "@tanstack/react-query";

export function useEmail(emailId: string) {
  const { sendToBackground } = useBackground();

  const query = useQuery({
    queryKey: ["emails", emailId],
    queryFn: async () => {
      const res = await sendToBackground("emails.get", { emailId });
      return res.email as Email;
    },
  });

  return { email: query.data, ...query };
}
