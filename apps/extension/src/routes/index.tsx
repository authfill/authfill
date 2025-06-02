import { Logo } from "@extension/components/logo";
import { useBackground } from "@extension/hooks/use-background";
import { useBackgroundListener } from "@extension/hooks/use-background-listener";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { UserPlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialized = useRef(false);
  const [code, setCode] = useState<string | null>(null);

  const { sendToBackground } = useBackground();

  useEffect(() => {
    if (initialized.current) return;
    sendToBackground("listener.start");
    initialized.current = true;
  }, []);

  useBackgroundListener("listener.result", (data) => {
    setCode(data.code);
  });

  return (
    <div className="w-100 flex flex-col p-8">
      <div className="flex items-center justify-between">
        <Logo className="w-24" />
        <Button
          onClick={() => {
            window.open(`${browser.runtime.getURL("index.html#/setup")}`);
          }}
          variant="ghost"
          size="icon"
        >
          <UserPlusIcon />
        </Button>
      </div>
      <div className="mt-10 flex flex-col items-center">
        {code ? (
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-muted-foreground">Found code:</h1>
            <p className="font-mono text-4xl font-bold">{code}</p>
          </div>
        ) : (
          <h1 className="mb-4 text-center text-3xl font-bold">
            Waiting for
            <br />
            email to arrive
          </h1>
        )}
      </div>
    </div>
  );
}
