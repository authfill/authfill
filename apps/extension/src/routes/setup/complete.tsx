import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/setup/complete")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Setup complete");

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  }, []);

  return (
    <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        You're all set!
      </h1>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        We've successfully connected your email account. You can now start using
        AuthFill.
      </p>
    </div>
  );
}
