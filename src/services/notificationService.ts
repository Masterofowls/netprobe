import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Resource, ResourceStatus } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const CHANNEL_ID = "netprobe-alerts";

export const setupNotifications = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "NetProbe Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      description: "Alerts when monitored services go offline",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const notifyResourceDown = async (resource: Resource): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ ${resource.name} is down`,
      body: `${resource.name} (${resource.url}) is ${resource.lastCheck?.status ?? "unreachable"}`,
      data: { resourceId: resource.id, url: resource.url },
      categoryIdentifier: "resource-alert",
    },
    trigger: null,
  });
};

export const notifyResourceRecovered = async (
  resource: Resource,
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `✅ ${resource.name} recovered`,
      body: `${resource.name} is back online (${resource.lastCheck?.latency ?? "?"}ms)`,
      data: { resourceId: resource.id, url: resource.url },
    },
    trigger: null,
  });
};

export const notifyBatchStatus = async (
  online: number,
  offline: number,
  total: number,
): Promise<void> => {
  if (offline === 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `NetProbe: ${offline} service${offline > 1 ? "s" : ""} down`,
      body: `${online}/${total} services online. Tap to view details.`,
      data: { type: "batch-status" },
    },
    trigger: null,
  });
};

const OFFLINE_STATUSES: ResourceStatus[] = [
  "offline",
  "timeout",
  "dns_failure",
  "error",
];

export const isOfflineStatus = (status: ResourceStatus): boolean =>
  OFFLINE_STATUSES.includes(status);
