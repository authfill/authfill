import { LinkProps } from "@tanstack/react-router";
import { Button, ButtonProps } from "@ui/button";
import ChromeIcon from "@web/components/icons/chrome";
import { links } from "@web/conf/links";
import { useMemo } from "react";

export default function StoreButton(
  props: Omit<ButtonProps & LinkProps, "as" | "to" | "children">,
) {
  const store = useMemo<keyof typeof links | null>(() => {
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("chrome") && !userAgent.includes("opr")) {
        // Check for Chrome, but exclude Opera which also includes "chrome" in userAgent
        return "CHROME_STORE";
      } else if (userAgent.includes("firefox")) {
        return "FIREFOX_STORE";
      }
    }
    return "CHROME_STORE";
  }, []);

  const buttonText = useMemo(() => {
    if (store === "CHROME_STORE") {
      return "Add to Chrome";
    } else if (store === "FIREFOX_STORE") {
      return "Add to Firefox";
    }
    return "Add to Browser";
  }, [store]);

  const buttonIcon = useMemo(() => {
    if (store === "CHROME_STORE") {
      return <ChromeIcon />;
    } else if (store === "FIREFOX_STORE") {
      return null;
    }
    return <ChromeIcon />;
  }, [store]);

  return (
    <Button
      as="link"
      to={store ? (links[store] as any) : undefined}
      {...(props as any)}
    >
      {buttonIcon}
      {buttonText}
    </Button>
  );
}
