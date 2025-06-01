import { useMemo } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

export type Theme = "system" | "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage("preferences.theme", "system");
  const media = useMediaQuery("(prefers-color-scheme: dark)");

  const shownTheme = useMemo(() => {
    if (theme !== "system") return theme;
    return media ? "dark" : "light";
  }, [theme, media]);

  return {
    dark: shownTheme === "dark",
    light: shownTheme === "light",
    shownTheme,
    theme,
    setTheme,
  };
}
