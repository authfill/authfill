import { usePopupId } from "@extension/hooks/use-popup-id";
import { useCallback, useEffect } from "react";
import browser from "webextension-polyfill";

export function useBackgroundListener(
  event: string,
  callback: (data: any) => void,
  deps?: any[],
) {
  const { popupId } = usePopupId();

  useEffect(() => {
    browser.runtime.onMessage.addListener(onMessage as any);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage as any);
    };
  }, [popupId, deps]);

  const onMessage = useCallback(
    (request: {
      event: string;
      popupId: string;
      data: {
        code: string;
      };
    }) => {
      if (request.popupId && request.popupId !== popupId) return;
      if (request.event !== event) return;

      callback(request.data);
    },
    [popupId, deps],
  );
}
