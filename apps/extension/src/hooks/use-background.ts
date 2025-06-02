import { usePopupId } from "@extension/hooks/use-popup-id";
import browser from "webextension-polyfill";

export function useBackground() {
  const { popupId } = usePopupId();

  function sendToBackground(event: string, data?: any) {
    return browser.runtime.sendMessage(undefined, {
      event,
      popupId,
      data: data,
    }) as Promise<any>;
  }

  return { sendToBackground };
}
