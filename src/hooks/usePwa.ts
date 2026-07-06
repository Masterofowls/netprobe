import { Platform } from "react-native";
import { useEffect } from "react";

export const usePwa = (): void => {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("[NetProbe] Service worker registration failed:", error);
    });
  }, []);
};
