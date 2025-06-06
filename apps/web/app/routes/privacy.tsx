import { createFileRoute } from "@tanstack/react-router";
import Legal from "@web/markdown/privacy.mdx";

export const Route = createFileRoute("/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-4xl p-5">
      <article className="prose dark:prose-invert">
        <Legal />
      </article>
    </div>
  );
}
