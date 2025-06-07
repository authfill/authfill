import { createFileRoute } from "@tanstack/react-router";
import Hero from "@web/components/landing/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="pt-10 xl:pt-32">
      <Hero />
    </div>
  );
}
