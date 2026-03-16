import { createFileRoute } from "@tanstack/react-router";
import Guide from "@web/markdown/microsoft-oauth-setup.mdx";

export const Route = createFileRoute("/(guides)/microsoft-oauth-setup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Guide />;
}
