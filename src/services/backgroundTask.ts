import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RESOURCES, DEFAULT_SETTINGS } from "../constants/resources";
import { checkResource } from "./networkChecker";
import { isOfflineStatus, notifyBatchStatus } from "./notificationService";
import { updateWidgetData } from "./widgetBridge";
import type { AppSettings, Resource } from "../types";

const BACKGROUND_TASK_NAME = "NETPROBE_BACKGROUND_CHECK";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log("[NetProbe] Background check starting...");
  try {
    const settingsJson = await AsyncStorage.getItem("@netprobe_settings");
    const settings: AppSettings = settingsJson
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) }
      : DEFAULT_SETTINGS;

    if (!settings.backgroundCheckEnabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const resourcesJson = await AsyncStorage.getItem("@netprobe_resources");
    const customResources: Resource[] = resourcesJson
      ? JSON.parse(resourcesJson)
      : [];
    const allResources = [...DEFAULT_RESOURCES, ...customResources];

    let online = 0;
    let offline = 0;

    const results = await Promise.allSettled(
      allResources.map((r) => checkResource(r.url, settings.timeout, r.id)),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.status === "online") {
          online++;
        } else if (isOfflineStatus(result.value.status)) {
          offline++;
        }
      }
    }

    await updateWidgetData(online, offline, allResources.length);

    if (settings.notificationsEnabled && offline > 0) {
      await notifyBatchStatus(online, offline, allResources.length);
    }

    console.log(
      `[NetProbe] Background check done: ${online} online, ${offline} offline`,
    );
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("[NetProbe] Background check failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async (): Promise<void> => {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    console.log("[NetProbe] Background task already registered");
    return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
  console.log("[NetProbe] Background task registered");
};

export const unregisterBackgroundTask = async (): Promise<void> => {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    await TaskManager.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    console.log("[NetProbe] Background task unregistered");
  }
};

export const getBackgroundTaskStatus = async (): Promise<{
  isRegistered: boolean;
  status: BackgroundFetch.BackgroundFetchStatus | null;
}> => {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  const status = await BackgroundFetch.getStatusAsync();
  return { isRegistered, status };
};
