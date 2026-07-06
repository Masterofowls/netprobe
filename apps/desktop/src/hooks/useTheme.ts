import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export type ThemeMode = "light" | "dark";

export const useThemeMode = (): ThemeMode => {
  const themeSetting = useAppStore((s) => s.settings.theme);
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const resolve = (): ThemeMode => {
      if (themeSetting === "light") return "light";
      if (themeSetting === "dark") return "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    setMode(resolve());

    if (themeSetting !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setMode(resolve());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themeSetting]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return mode;
};
