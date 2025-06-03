import { portAtom } from "@extension/hooks/use-port";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import browser from "webextension-polyfill";

export function usePortListener(
  event: string,
  callback: (data: any) => void,
  deps?: any[],
) {
  const initialized = useRef(false);
  const [port] = useAtom(portAtom);

  useEffect(() => {
    if (!port || initialized.current) return;
    initialized.current = true;

    port.onMessage.addListener(onMessage as any);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage as any);
    };
  }, [port, initialized]);

  const onMessage = useCallback(
    (request: {
      event: string;
      data: {
        code: string;
      };
    }) => {
      if (request.event !== event) return;
      callback(request.data);
    },
    [deps],
  );
}
