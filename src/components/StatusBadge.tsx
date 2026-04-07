import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { ResourceStatus } from '../types';

interface StatusBadgeProps {
  status: ResourceStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
  ResourceStatus,
  { label: string; color: string; bgColor: string }
> = {
  online: { label: 'Online', color: '#1B5E20', bgColor: '#C8E6C9' },
  offline: { label: 'Offline', color: '#B71C1C', bgColor: '#FFCDD2' },
  timeout: { label: 'Timeout', color: '#E65100', bgColor: '#FFE0B2' },
  dns_failure: { label: 'DNS Fail', color: '#4A148C', bgColor: '#E1BEE7' },
  blocked: { label: 'Blocked', color: '#BF360C', bgColor: '#FFCCBC' },
  error: { label: 'Error', color: '#C62828', bgColor: '#FFCDD2' },
  checking: { label: 'Checking...', color: '#1565C0', bgColor: '#BBDEFB' },
  unknown: { label: 'Unknown', color: '#616161', bgColor: '#E0E0E0' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];
  const isDark = theme.dark;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? `${config.color}40` : config.bgColor,
          paddingHorizontal: size === 'medium' ? 14 : 10,
          paddingVertical: size === 'medium' ? 6 : 4,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: config.color,
            width: status === 'checking' ? 8 : 6,
            height: status === 'checking' ? 8 : 6,
          },
        ]}
      />
      <Text
        variant={size === 'medium' ? 'labelMedium' : 'labelSmall'}
        style={{ color: isDark ? config.bgColor : config.color }}
      >
        {config.label}
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
