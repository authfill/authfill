import { useGoogleAuth } from "@extension/hooks/auth/use-google-auth";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";

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
          <div className="flex items-center gap-5">
            <hr className="border-muted-foreground/50 w-full" />
            <p className="text-muted-foreground text-sm">Or</p>
            <hr className="border-muted-foreground/50 w-full" />
          </div>
        </div>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
