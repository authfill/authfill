import { Logo } from "@extension/components/logo";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialized = useRef(false);
  const [popupId] = useState<string | null>(Math.random().toString(16));
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;

    browser.runtime.sendMessage(undefined, {
      event: "listener.start",
      data: { popupId },
    });

    initialized.current = true;
  }, [popupId]);

  useEffect(() => {
    browser.runtime.onMessage.addListener(onMessage as any);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage as any);
    };
  }, [popupId]);

  const onMessage = useCallback(
    (request: {
      event: string;
      popupId: string;
      data: {
        code: string;
      };
    }) => {
      if (request.popupId !== popupId) return;

      switch (request.event) {
        case "listener.result":
          setCode(request.data.code);
          break;
      }
    },
    [popupId],
  );

  return (
    <div className="w-100 flex flex-col p-8">
      <Logo className="w-30 h-auto" />
      <div className="mt-10 flex flex-col items-center">
        {code ? (
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-muted-foreground">Found code:</h1>
            <p className="font-mono text-4xl font-bold">{code}</p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-3xl font-semibold">
              Waiting for
              <br />
              email to arrive
            </h1>
          </>
        )}
      </div>
    </div>
  );
}
