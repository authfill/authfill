import { createFileRoute } from "@tanstack/react-router";
import Legal from "@web/markdown/privacy.mdx";

export const Route = createFileRoute("/(legal)/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Legal />;
}
