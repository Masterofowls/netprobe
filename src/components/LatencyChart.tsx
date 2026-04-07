import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { CheckResult } from '../types';

interface LatencyChartProps {
  history: CheckResult[];
}

export const LatencyChart: React.FC<LatencyChartProps> = ({ history }) => {
  const theme = useTheme();
  const validEntries = history
    .filter((h) => h.latency !== null && h.status === 'online')
    .slice(0, 20)
    .reverse();

  if (validEntries.length < 2) {
    return (
      <View style={styles.empty}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Not enough data for chart
        </Text>
      </View>
    );
  }

  const latencies = validEntries.map((e) => e.latency as number);
  const maxLatency = Math.max(...latencies);
  const minLatency = Math.min(...latencies);
  const avgLatency = Math.round(
    latencies.reduce((a, b) => a + b, 0) / latencies.length,
  );
  const chartWidth = Dimensions.get('window').width - 80;
  const chartHeight = 120;
  const barWidth = Math.max(
    4,
    Math.min(16, (chartWidth - validEntries.length * 2) / validEntries.length),
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <StatItem label="Min" value={`${minLatency}ms`} theme={theme} />
        <StatItem label="Avg" value={`${avgLatency}ms`} theme={theme} />
        <StatItem label="Max" value={`${maxLatency}ms`} theme={theme} />
      </View>
      <View style={[styles.chart, { height: chartHeight }]}>
        {validEntries.map((entry, index) => {
          const height =
            maxLatency > 0
              ? ((entry.latency as number) / maxLatency) * (chartHeight - 20)
              : 0;
          const color = getLatencyColor(entry.latency as number);
          return (
            <View
              key={`bar-${entry.timestamp}-${index}`}
              style={[
                styles.bar,
                {
                  height: Math.max(4, height),
                  width: barWidth,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  theme: { colors: { onSurfaceVariant: string; onSurface: string } };
}

const StatItem: React.FC<StatItemProps> = ({ label, value, theme }) => (
  <View style={styles.stat}>
    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
      {label}
    </Text>
    <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
      {value}
    </Text>
  </View>
);

const getLatencyColor = (latency: number): string => {
  if (latency < 100) return '#4CAF50';
  if (latency < 300) return '#FFC107';
  if (latency < 1000) return '#FF9800';
  return '#F44336';
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingHorizontal: 4,
  },
  bar: {
    borderRadius: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
