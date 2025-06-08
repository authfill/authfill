import { createFileRoute } from "@tanstack/react-router";
import Hero from "@web/components/landing/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center pt-10 xl:pt-32">
      <Hero />
      <span className="text-center text-lg font-bold text-gray-500">
        COMING SOON!!!
      </span>
    </div>
  );
}
