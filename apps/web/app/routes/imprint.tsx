import { createFileRoute } from "@tanstack/react-router";
import Legal from "@web/markdown/imprint.mdx";

export const Route = createFileRoute("/imprint")({
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
