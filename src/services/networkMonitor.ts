import NetInfo, {
  type NetInfoState,
  type NetInfoSubscription,
} from "@react-native-community/netinfo";
import type { NetworkState } from "../types";

type NetworkStateListener = (state: NetworkState) => void;

let subscription: NetInfoSubscription | null = null;
const listeners: Set<NetworkStateListener> = new Set();

const mapState = (state: NetInfoState): NetworkState => ({
  isConnected: state.isConnected,
  type: state.type,
  isInternetReachable: state.isInternetReachable,
  details: state.details as Record<string, unknown> | null,
});

export const startNetworkMonitor = (): void => {
  if (subscription) return;

  subscription = NetInfo.addEventListener((state) => {
    const mapped = mapState(state);
    console.log(
      `[NetProbe] Network: ${mapped.type} connected=${mapped.isConnected} reachable=${mapped.isInternetReachable}`,
    );
    for (const listener of listeners) {
      listener(mapped);
    }
  });
};

export const stopNetworkMonitor = (): void => {
  if (subscription) {
    subscription();
    subscription = null;
  }
  listeners.clear();
};

export const addNetworkListener = (
  listener: NetworkStateListener,
): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCurrentNetworkState = async (): Promise<NetworkState> => {
  const state = await NetInfo.fetch();
  return mapState(state);
};
