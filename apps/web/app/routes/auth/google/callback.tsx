import { scopes } from "@conf/google";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/loader";
import { useExtension } from "@web/hooks/use-extension";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/google/callback")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: String(search.code),
      scope: String(search.scope),
    };
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { sendMessage } = useExtension();

  useEffect(() => {
    if (!search.scope) return;

    for (const scope of scopes) {
      if (search.scope.includes(scope)) continue;
      navigate({ to: "/auth/google/missing-scope" });
      return;
    }

    exchange();
  }, [search]);

  async function exchange() {
    try {
      const res = await axios.post(
        `${import.meta.env.PUBLIC_PROXY_URL}/auth/google`,
        {
          code: search.code,
        },
      );

      const result = await sendMessage("auth.google", res.data);
      if (!result.success) return toast.error("Failed to save user");
    } catch {
      toast.error("Something went wrong! Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <Loader big />
    </div>
  );
}
