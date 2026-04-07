import * as Haptics from "expo-haptics";
import type { ResourceStatus } from "../types";

export const hapticSuccess = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticWarning = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const hapticError = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const hapticLight = async (): Promise<void> => {
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
