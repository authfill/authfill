import { Logo } from "@extension/components/logo";
import { useAccounts } from "@extension/hooks/use-accounts";
import { usePortListener } from "@extension/hooks/use-port-listener";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { InboxIcon, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialized = useRef(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;

    browser.runtime.connect();

    initialized.current = true;
  }, []);

  usePortListener("otp.result", (data) => {
    setCode(data.code);
  });

  const { accounts } = useAccounts();

  return (
    <div className="w-100 flex flex-col p-7 pt-5">
      <div className="flex items-center justify-between">
        <Link to={import.meta.env.PUBLIC_WEB_URL} target="_blank">
          <Logo className="w-24" />
        </Link>
        <div className="flex items-center">
          <Button
            onClick={() => {
              window.open(`${browser.runtime.getURL("index.html#/setup")}`);
            }}
            variant="ghost"
            size="icon"
          >
            <InboxIcon />
          </Button>
          <Button
            onClick={() => {
              window.open(`${browser.runtime.getURL("index.html#/setup")}`);
            }}
            variant="ghost"
            size="icon"
          >
            <UsersIcon />
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center">
        {code ? (
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-muted-foreground">Found code:</h1>
            <p className="font-mono text-4xl font-bold">{code}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img src="/loading.gif" alt="loading" className="my-[-2rem]" />
            <h1 className="mb-4 mt-4 text-center text-2xl font-semibold">
              Checking your emails...
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
