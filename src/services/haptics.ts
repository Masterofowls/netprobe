import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type { ResourceStatus } from "../types";

const noop = async (): Promise<void> => {};

export const hapticSuccess = Platform.OS === "web" ? noop : async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticWarning = Platform.OS === "web" ? noop : async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const hapticError = Platform.OS === "web" ? noop : async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const hapticLight = Platform.OS === "web" ? noop : async (): Promise<void> => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const hapticForStatus = async (
  status: ResourceStatus,
): Promise<void> => {
  switch (status) {
    case "online":
      await hapticSuccess();
      break;
    case "offline":
    case "error":
    case "dns_failure":
      await hapticError();
      break;
    case "timeout":
    case "blocked":
      await hapticWarning();
      break;
    default:
      break;
  }
};
