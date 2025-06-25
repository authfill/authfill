import { createFileRoute } from "@tanstack/react-router";
import Legal from "@web/markdown/terms.mdx";

export const Route = createFileRoute("/(legal)/terms")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Legal />;
}
