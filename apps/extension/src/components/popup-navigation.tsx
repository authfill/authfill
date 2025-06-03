import { Logo } from "@extension/components/logo";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { UsersIcon } from "lucide-react";
import browser from "webextension-polyfill";

export function PopupNavigation() {
  return (
    <div className="flex items-center justify-between">
      <Link to={import.meta.env.PUBLIC_WEB_URL} target="_blank">
        <Logo className="w-24" />
      </Link>
      <div className="flex items-center">
        <Button
          onClick={() => {
            window.open(`${browser.runtime.getURL("index.html#/accounts")}`);
          }}
          variant="ghost"
          size="icon"
        >
          <UsersIcon />
        </Button>
      </div>
    </div>
  );
}
