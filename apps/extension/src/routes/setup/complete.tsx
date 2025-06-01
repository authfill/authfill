import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/setup/complete")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          You're all set!
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          We've successfully connected your email account. You can now start
          using AuthFill.
        </p>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
