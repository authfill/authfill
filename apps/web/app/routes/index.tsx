import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <Button>Hello, world!</Button>;
}
