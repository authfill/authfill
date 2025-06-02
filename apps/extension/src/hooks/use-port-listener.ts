import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import browser from "webextension-polyfill";

const portAtom = atom<browser.Runtime.Port>(browser.runtime.connect());

export function usePortListener(
  event: string,
  callback: (data: any) => void,
  deps?: any[],
) {
  const [port] = useAtom(portAtom);

  useEffect(() => {
    port.onMessage.addListener(onMessage as any);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage as any);
    };
  }, [port]);

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
