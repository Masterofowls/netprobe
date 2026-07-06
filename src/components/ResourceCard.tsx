import React from 'react';
import { Image, StyleSheet, View } from "react-native";
import {
  Card,
  Icon,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import * as Linking from "expo-linking";
import type { Resource } from "../types";
import { StatusBadge } from "./StatusBadge";
import { countryCodeToFlag } from "../services/geoLookup";

interface ResourceCardProps {
  resource: Resource;
  pinned?: boolean;
  faviconUrl?: string | null;
  onPress: () => void;
  onLongPress?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  pinned,
  faviconUrl,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();
  const status = resource.lastCheck?.status ?? "unknown";
  const latency = resource.lastCheck?.latency;

  return (
    <Card style={styles.card} mode="elevated">
      <TouchableRipple
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.ripple}
        borderless
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${resource.color}20` },
            ]}
          >
            {faviconUrl ? (
              <Image
                source={{ uri: faviconUrl }}
                style={styles.favicon}
                resizeMode="contain"
              />
            ) : (
              <Icon source={resource.icon} size={28} color={resource.color} />
            )}
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, flex: 1 }}
                numberOfLines={1}
              >
                {resource.name}
              </Text>
              {pinned && (
                <Icon source="pin" size={14} color={theme.colors.primary} />
              )}
            </View>
            {resource.category && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {resource.category}
              </Text>
            )}
            {(resource.lastCheck?.resolvedIp ||
              resource.lastCheck?.countryCode) && (
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {resource.lastCheck.countryCode
                  ? `${countryCodeToFlag(resource.lastCheck.countryCode)} `
                  : ""}
                {resource.lastCheck.resolvedIp ?? ""}
              </Text>
            )}
          </View>
          <View style={styles.statusArea}>
            <StatusBadge status={status} />
            {latency !== null &&
              latency !== undefined &&
              status === "online" && (
                <Text
                  variant="labelSmall"
                  style={[
                    styles.latency,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {latency}ms
                </Text>
              )}
          </View>
          <IconButton
            icon="open-in-new"
            size={20}
            onPress={() => Linking.openURL(resource.url)}
          />
        </View>
      </TouchableRipple>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  ripple: {
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  favicon: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusArea: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  latency: {
    marginTop: 4,
  },
});
