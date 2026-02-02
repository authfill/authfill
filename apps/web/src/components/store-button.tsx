import { LinkProps } from "@tanstack/react-router";
import { Button, ButtonProps } from "@ui/button";
import { ChromeIcon } from "@web/components/icons/chrome";
import { EdgeIcon } from "@web/components/icons/edge";
import { FirefoxIcon } from "@web/components/icons/firefox";
import { storeLinks } from "@web/conf/store";
import { useMemo } from "react";
import {
    isEdge,
    isEdgeChromium,
    isFirefox
} from "react-device-detect";

export function StoreButton(
  props: Omit<ButtonProps & LinkProps, "as" | "to" | "children">,
) {
  const browser = useMemo(() => {
    if (isFirefox && storeLinks["FIREFOX"]) return "FIREFOX";
    if ((isEdge || isEdgeChromium) && storeLinks["EDGE"]) return "EDGE";
    return "CHROME";
  }, []);

  const buttonText = useMemo(() => {
    if (browser === "FIREFOX") return "Add to Firefox";
    if (browser === "EDGE") return "Add to Edge";
    return "Add to Chrome";
  }, [browser]);

  const buttonIcon = useMemo(() => {
    if (browser === "FIREFOX") return <FirefoxIcon />;
    if (browser === "EDGE") return <EdgeIcon />;
    return <ChromeIcon />;
  }, [browser]);

  return (
    <Button as="link" to={storeLinks[browser]} {...(props as any)}>
      {buttonIcon}
      {buttonText}
    </Button>
  );
}
