import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { ResourceStatus } from '../types';
import { useT } from "../hooks/useTranslation";

interface StatusBadgeProps {
  status: ResourceStatus;
  size?: "small" | "medium";
}

const STATUS_COLORS: Record<
  ResourceStatus,
  { color: string; bgColor: string }
> = {
  online: { color: "#1B5E20", bgColor: "#C8E6C9" },
  offline: { color: "#B71C1C", bgColor: "#FFCDD2" },
  timeout: { color: "#E65100", bgColor: "#FFE0B2" },
  dns_failure: { color: "#4A148C", bgColor: "#E1BEE7" },
  blocked: { color: "#BF360C", bgColor: "#FFCCBC" },
  error: { color: "#C62828", bgColor: "#FFCDD2" },
  checking: { color: "#1565C0", bgColor: "#BBDEFB" },
  unknown: { color: "#616161", bgColor: "#E0E0E0" },
};

const STATUS_KEY_MAP: Record<ResourceStatus, string> = {
  online: "statusOnline",
  offline: "statusOffline",
  timeout: "statusTimeout",
  dns_failure: "statusDnsFailure",
  blocked: "statusBlocked",
  error: "statusError",
  checking: "statusChecking",
  unknown: "statusUnknown",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "small",
}) => {
  const theme = useTheme();
  const t = useT();
  const colors = STATUS_COLORS[status];
  const isDark = theme.dark;
  const label = t[STATUS_KEY_MAP[status] as keyof typeof t] as string;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? `${colors.color}40` : colors.bgColor,
          paddingHorizontal: size === "medium" ? 14 : 10,
          paddingVertical: size === "medium" ? 6 : 4,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: colors.color,
            width: status === "checking" ? 8 : 6,
            height: status === "checking" ? 8 : 6,
          },
        ]}
      />
      <Text
        variant={size === "medium" ? "labelMedium" : "labelSmall"}
        style={{ color: isDark ? colors.bgColor : colors.color }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    borderRadius: 4,
  },
});
