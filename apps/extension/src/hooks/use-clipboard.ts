import { useCallback } from "react";

export function useClipboard() {
  const copyText = useCallback(async (text: string) => {
    try {
      if (
        navigator &&
        "clipboard" in navigator &&
        "writeText" in navigator.clipboard
      ) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      console.warn("Failed to copy via navigator.clipboard");
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }, []);

  return { copyText };
}
