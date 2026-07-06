import React from "react";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { DESKTOP_MAX_WIDTH, useIsDesktop } from "../hooks/useLayout";

interface DesktopShellProps extends ViewProps {
  children: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  children,
  style,
  ...props
}) => {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <View style={[styles.fill, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.fill, styles.desktopBackdrop, style]} {...props}>
      <View style={styles.desktopFrame}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  desktopBackdrop: {
    alignItems: "center",
    ...(Platform.OS === "web"
      ? ({
          backgroundImage:
            "linear-gradient(180deg, rgba(26,26,46,0.35) 0%, rgba(26,26,46,0) 120px)",
        } as object)
      : null),
  },
  desktopFrame: {
    flex: 1,
    width: "100%",
    maxWidth: DESKTOP_MAX_WIDTH,
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.25)",
        } as object)
      : null),
  },
});
