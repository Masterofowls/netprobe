import { useEffect } from "react";
import {
  addNetworkListener,
  startNetworkMonitor,
  stopNetworkMonitor,
} from "../services/networkMonitor";
import { useAppStore } from "../store/useAppStore";

export const useNetworkMonitor = () => {
  const { setNetworkState, checkAllResources, networkState } = useAppStore();

  useEffect(() => {
    startNetworkMonitor();

    const unsubscribe = addNetworkListener((state) => {
      const wasConnected = networkState.isConnected;
      setNetworkState(state);

      // Auto-check when connectivity is restored
      if (wasConnected === false && state.isConnected === true) {
        console.log("[NetProbe] Connectivity restored, running check...");
        checkAllResources();
      }
    });

    return () => {
      unsubscribe();
      stopNetworkMonitor();
    };
  }, [setNetworkState, checkAllResources, networkState.isConnected]);

  return networkState;
};
