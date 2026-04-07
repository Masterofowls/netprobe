import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useAutoRefresh = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { settings, checkAllResources } = useAppStore();

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (settings.autoRefresh && settings.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        checkAllResources();
      }, settings.refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings.autoRefresh, settings.refreshInterval, checkAllResources]);
};
