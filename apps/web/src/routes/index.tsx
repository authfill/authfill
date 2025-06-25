import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "@web/components/landing/demo";
import Hero from "@web/components/landing/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Demo />
    </>
  );
}
