import { atom, useAtom } from "jotai";

const popupIdAtom = atom<string | null>(Math.random().toString(16));

export function usePopupId() {
  const [popupId, setPopupId] = useAtom(popupIdAtom);

  return { popupId, setPopupId };
}
