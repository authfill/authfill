import { Logo } from "@extension/components/logo";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/setup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="flex min-h-screen w-screen flex-col items-center pb-10 pt-24">
        <Logo className="w-30 absolute left-1/2 top-8 -translate-x-1/2" />
        <div className="mt-auto"></div>
        <Outlet />
        <div className="mb-auto"></div>
      </div>
    </div>
  );
}
