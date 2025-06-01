import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import browser from "webextension-polyfill";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-20">
      <Button
        onClick={() => {
          browser.runtime.sendMessage(undefined, {
            event: "listener.start",
          });
        }}
      >
        Start Listener
      </Button>
    </div>
  );
}
