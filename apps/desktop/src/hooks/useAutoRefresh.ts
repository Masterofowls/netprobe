import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export const useAutoRefresh = (): void => {
  const { settings, checkAllResources, isChecking } = useAppStore();

  useEffect(() => {
    if (!settings.autoRefresh) return;

    const id = window.setInterval(() => {
      if (!isChecking) checkAllResources();
    }, settings.refreshInterval);

    return () => window.clearInterval(id);
  }, [
    settings.autoRefresh,
    settings.refreshInterval,
    checkAllResources,
    isChecking,
  ]);
};
