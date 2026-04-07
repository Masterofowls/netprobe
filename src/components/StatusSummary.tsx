import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { Resource } from '../types';

interface StatusSummaryProps {
  resources: Resource[];
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ resources }) => {
  const theme = useTheme();

  const counts = resources.reduce(
    (acc, r) => {
      const status = r.lastCheck?.status ?? 'unknown';
      if (status === 'online') acc.online++;
      else if (status === 'checking' || status === 'unknown') acc.pending++;
      else acc.issues++;
      return acc;
    },
    { online: 0, issues: 0, pending: 0 },
  );

  return (
    <View style={styles.container}>
      <SummaryItem
        label="Online"
        count={counts.online}
        color="#4CAF50"
        theme={theme}
      />
      <SummaryItem
        label="Issues"
        count={counts.issues}
        color="#F44336"
        theme={theme}
      />
      <SummaryItem
        label="Pending"
        count={counts.pending}
        color="#FF9800"
        theme={theme}
      />
      <SummaryItem
        label="Total"
        count={resources.length}
        color={theme.colors.primary}
        theme={theme}
      />
    </View>
  );
};

interface SummaryItemProps {
  label: string;
  count: number;
  color: string;
  theme: { colors: { onSurfaceVariant: string } };
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  count,
  color,
  theme,
}) => (
  <View style={[styles.item, { backgroundColor: `${color}15` }]}>
    <Text variant="headlineSmall" style={{ color, fontWeight: '700' }}>
      {count}
    </Text>
    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
});
