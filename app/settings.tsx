import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  List,
  RadioButton,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAppStore } from '../src/store/useAppStore';

const INTERVAL_OPTIONS = [
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
];

const TIMEOUT_OPTIONS = [
  { label: '5 seconds', value: 5000 },
  { label: '10 seconds', value: 10000 },
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings, resetToDefaults, resources } =
    useAppStore();

  const customCount = resources.filter((r) => !r.isBuiltIn).length;
  const builtInCount = resources.filter((r) => r.isBuiltIn).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Auto Refresh */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Auto Refresh
          </Text>
          <List.Item
            title="Enable Auto Refresh"
            description="Periodically check all resources"
            right={() => (
              <Switch
                value={settings.autoRefresh}
                onValueChange={(value) =>
                  updateSettings({ autoRefresh: value })
                }
              />
            )}
          />
          {settings.autoRefresh && (
            <>
              <Divider style={styles.divider} />
              <Text
                variant="labelLarge"
                style={{ marginTop: 8, marginBottom: 4 }}
              >
                Refresh Interval
              </Text>
              <RadioButton.Group
                value={String(settings.refreshInterval)}
                onValueChange={(value) =>
                  updateSettings({ refreshInterval: Number(value) })
                }
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <RadioButton.Item
                    key={opt.value}
                    label={opt.label}
                    value={String(opt.value)}
                  />
                ))}
              </RadioButton.Group>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Request Timeout */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Request Timeout
          </Text>
          <RadioButton.Group
            value={String(settings.timeout)}
            onValueChange={(value) =>
              updateSettings({ timeout: Number(value) })
            }
          >
            {TIMEOUT_OPTIONS.map((opt) => (
              <RadioButton.Item
                key={opt.value}
                label={opt.label}
                value={String(opt.value)}
              />
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Theme */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Theme
          </Text>
          <RadioButton.Group
            value={settings.theme}
            onValueChange={(value) =>
              updateSettings({
                theme: value as "light" | "dark" | "system",
              })
            }
          >
            <RadioButton.Item label="System Default" value="system" />
            <RadioButton.Item label="Light" value="light" />
            <RadioButton.Item label="Dark" value="dark" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* System Integration */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            System Integration
          </Text>
          <List.Item
            title="Notifications"
            description="Alert when services go offline or recover"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) =>
                  updateSettings({ notificationsEnabled: value })
                }
              />
            )}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Background Monitoring"
            description="Check services periodically when app is closed"
            left={(props) => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={settings.backgroundCheckEnabled}
                onValueChange={(value) =>
                  updateSettings({ backgroundCheckEnabled: value })
                }
              />
            )}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Haptic Feedback"
            description="Vibrate on status changes"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) =>
                  updateSettings({ hapticFeedback: value })
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Stats */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Statistics
          </Text>
          <List.Item
            title="Built-in Resources"
            right={() => <Text variant="bodyLarge">{builtInCount}</Text>}
          />
          <Divider />
          <List.Item
            title="Custom Resources"
            right={() => <Text variant="bodyLarge">{customCount}</Text>}
          />
          <Divider />
          <List.Item
            title="Total Resources"
            right={() => <Text variant="bodyLarge">{resources.length}</Text>}
          />
        </Card.Content>
      </Card>

      {/* Reset */}
      <View style={styles.resetSection}>
        <Button
          mode="outlined"
          onPress={resetToDefaults}
          icon="restore"
          textColor={theme.colors.error}
          style={styles.resetButton}
        >
          Reset to Defaults
        </Button>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          This will remove all custom resources and restore default settings
        </Text>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          NetProbe v1.2.0{"\n"}
          Real-time Network Connectivity Tester
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 4,
  },
  resetSection: {
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  resetButton: {
    borderColor: '#F44336',
    borderRadius: 12,
  },
  footer: {
    padding: 24,
  },
});
