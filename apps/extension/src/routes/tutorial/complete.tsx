import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tutorial/complete")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        You're all set!
      </h1>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        You've successfully finished the setup and tutorial. You can now start
        using AuthFill.
      </p>
    </div>
  );
}
