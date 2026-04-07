import { NativeModules, Platform } from "react-native";
import type { Resource, ResourceStatus } from "../types";

const { NetProbeWidget } = NativeModules;

export interface WidgetData {
  online: number;
  offline: number;
  total: number;
  lastCheck: string;
  resources: Array<{
    name: string;
    status: ResourceStatus;
    latency: number | null;
  }>;
}

export const updateWidgetData = async (
  online: number,
  offline: number,
  total: number,
  resources?: Resource[],
): Promise<void> => {
  if (Platform.OS !== "android") return;

  const data: WidgetData = {
    online,
    offline,
    total,
    lastCheck: new Date().toISOString(),
    resources: resources
      ? resources.slice(0, 8).map((r) => ({
          name: r.name,
          status: r.lastCheck?.status ?? "unknown",
          latency: r.lastCheck?.latency ?? null,
        }))
      : [],
  };

  try {
    if (NetProbeWidget?.updateWidget) {
      await NetProbeWidget.updateWidget(JSON.stringify(data));
      console.log("[NetProbe] Widget data updated");
    }
  } catch (error) {
    console.warn("[NetProbe] Widget update failed:", error);
  }
};

export const requestWidgetRefresh = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  try {
    if (NetProbeWidget?.refreshWidget) {
      await NetProbeWidget.refreshWidget();
    }
  } catch (error) {
    console.warn("[NetProbe] Widget refresh failed:", error);
  }
};
