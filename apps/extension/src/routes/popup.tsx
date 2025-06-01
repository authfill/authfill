import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/popup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="p-20">Welcome to AuthFill!</div>;
}
