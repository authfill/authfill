import { Layout } from "@extension/components/layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/emails")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
