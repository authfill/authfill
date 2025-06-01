import { useCallback } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    chrome: {
      runtime: {
        sendMessage: (extensionId: string, message: any) => Promise<any>;
      };
    };
  }
}

export function useExtension() {
  const sendMessage = useCallback(async (event: string, data: any) => {
    // TODO: Add support for Firefox/Safari
    if (
      !("chrome" in window) ||
      !window.chrome ||
      !window.chrome.runtime ||
      !window.chrome.runtime.sendMessage
    ) {
      toast.error("Something went wrong! Please try again.");
      return;
    }

    return window.chrome.runtime.sendMessage(
      import.meta.env.PUBLIC_EXTENSION_ID!,
      {
        event,
        data,
      },
    );
  }, []);

  return { sendMessage };
}
