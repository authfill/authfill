import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-20">
      Welcome to AuthFill!
      <Button>Hello, world!</Button>
    </div>
  );
}
