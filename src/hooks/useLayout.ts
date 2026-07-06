import { Platform, useWindowDimensions } from "react-native";

const DESKTOP_BREAKPOINT = 900;

export const useIsDesktop = (): boolean => {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
};

export const DESKTOP_MAX_WIDTH = 1280;
