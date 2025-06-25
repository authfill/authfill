import { Button } from "@ui/button";
import browser from "webextension-polyfill";

export function AccountsEmpty() {
  return (
    <div className="flex flex-col items-center pb-6">
      <h1 className="mt-4 text-center text-2xl font-semibold">
        Connect your email
      </h1>
      <p className="text-muted-foreground text-center text-sm">
        Please connect your email to get started.
      </p>
      <Button
        onClick={() => window.open(browser.runtime.getURL("index.html#/setup"))}
        className="mt-6"
      >
        Add email account
      </Button>
    </div>
  );
}
