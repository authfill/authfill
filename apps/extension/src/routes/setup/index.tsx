import { useGoogleAuth } from "@extension/hooks/auth/use-google-auth";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { CogIcon } from "lucide-react";

export const Route = createFileRoute("/setup/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { authenticateGoogle } = useGoogleAuth();

  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          Connect your email accounts
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          To get started with AuthFill, please connect your email accounts with
          the options shown below.
        </p>
        <div className="mt-12 flex w-full max-w-full flex-col gap-4 sm:max-w-[15rem]">
          <Button onClick={authenticateGoogle} className="w-full" size="xl">
            <img src="/gmail.svg" className="mr-2 size-5" />
            Connect to Gmail
          </Button>
          <Button
            variant="secondary"
            as="link"
            to="/setup/custom"
            className="w-full"
            size="xl"
          >
            <CogIcon className="mr-2" />
            Custom IMAP Server
          </Button>
        </div>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
