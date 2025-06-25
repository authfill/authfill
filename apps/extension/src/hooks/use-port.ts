import { usePopupId } from "@extension/hooks/use-popup-id";
import { atom, useAtom } from "jotai";
import browser from "webextension-polyfill";

export const portAtom = atom<browser.Runtime.Port>(browser.runtime.connect());

export function usePort() {
  const [port] = useAtom(portAtom);
  const { popupId } = usePopupId();

  function sendToPort(event: string, data?: any) {
    return port.postMessage({
      event,
      popupId,
      data: data,
    });
  }

  return { sendToPort };
}
