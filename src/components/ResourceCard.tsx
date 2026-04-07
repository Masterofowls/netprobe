import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { Resource } from '../types';
import { StatusBadge } from './StatusBadge';

interface ResourceCardProps {
  resource: Resource;
  onPress: () => void;
  onLongPress?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();
  const status = resource.lastCheck?.status ?? 'unknown';
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
            <Icon
              source={resource.icon}
              size={28}
              color={resource.color}
            />
          </View>
          <View style={styles.info}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface }}
              numberOfLines={1}
            >
              {resource.name}
            </Text>
            {resource.category && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {resource.category}
              </Text>
            )}
          </View>
          <View style={styles.statusArea}>
            <StatusBadge status={status} />
            {latency !== null && latency !== undefined && status === 'online' && (
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
  },
  ripple: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  statusArea: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  latency: {
    marginTop: 4,
  },
});
