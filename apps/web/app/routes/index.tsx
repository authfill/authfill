import { createFileRoute } from "@tanstack/react-router";
import Features from "@web/components/landing/features";
import Hero from "@web/components/landing/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center pt-10 xl:pt-32">
      <Hero />
      <div className="h-102" />
      <Features />

      <div className="h-24" />
    </div>
  );
}
