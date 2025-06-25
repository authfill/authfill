import { createFileRoute } from "@tanstack/react-router";
import Legal from "@web/markdown/imprint.mdx";

export const Route = createFileRoute("/(legal)/imprint")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Legal />;
}
