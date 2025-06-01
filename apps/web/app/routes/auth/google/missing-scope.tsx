import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";

export const Route = createFileRoute("/auth/google/missing-scope")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="flex flex-col items-center">
        <h1 className="max-w-md text-center text-4xl font-bold tracking-tight">
          Oops! Please give us access to your emails
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-center text-sm">
          Please check the following checkbox inside the google login to give us
          access to your emails. We will never store your emails.
        </p>
        <Button size="xl" as="link" to="/auth/google" className="mt-6">
          Retry with Google
        </Button>
        <img
          src="/google-scope.jpg"
          className="mt-12 w-full max-w-xl rounded-lg dark:border-4 dark:border-white/20"
        />
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
