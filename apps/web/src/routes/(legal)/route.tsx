import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(legal)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <article className="prose dark:prose-invert mx-auto max-w-[90vw] py-8 sm:max-w-xl sm:py-12">
      <Outlet />
    </article>
  );
}
