import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { useRouter } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import { RESOURCE_CATALOG } from "../src/constants/catalog";
import { useT } from "../src/hooks/useTranslation";
import {
  DataManagementCard,
  DeepChecksCard,
} from "../src/components/DataManagementCard";

const INTERVAL_OPTIONS = [
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "1m", value: 60000 },
  { label: "5m", value: 300000 },
];

const TIMEOUT_OPTIONS = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const t = useT();
  const { settings, updateSettings, resetToDefaults, resources } =
    useAppStore();

  const customCount = resources.filter((r) => !r.isBuiltIn).length;
  const builtInCount = resources.filter((r) => r.isBuiltIn).length;
  const catalogTotal = RESOURCE_CATALOG.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Language */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.language}
          </Text>
          <RadioButton.Group
            value={settings.language}
            onValueChange={(value) =>
              updateSettings({ language: value as "en" | "ru" })
            }
          >
            <RadioButton.Item label="English" value="en" />
            <RadioButton.Item label="Русский" value="ru" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Auto Refresh */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.autoRefresh}
          </Text>
          <List.Item
            title={t.autoRefresh}
            description={t.autoRefreshDesc}
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
                {t.refreshInterval}
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
            {t.requestTimeout}
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
            {t.theme}
          </Text>
          <RadioButton.Group
            value={settings.theme}
            onValueChange={(value) =>
              updateSettings({
                theme: value as "light" | "dark" | "system",
              })
            }
          >
            <RadioButton.Item label={t.systemDefault} value="system" />
            <RadioButton.Item label={t.light} value="light" />
            <RadioButton.Item label={t.dark} value="dark" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <DeepChecksCard settings={settings} updateSettings={updateSettings} />
      <DataManagementCard />

      {/* Resource Catalog */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.resourceCatalog}
          </Text>
          <List.Item
            title={t.hideBuiltIn}
            description={t.hideBuiltInDesc}
            left={(props) => <List.Icon {...props} icon="eye-off-outline" />}
            right={() => (
              <Switch
                value={settings.hideBuiltIn}
                onValueChange={(value) =>
                  updateSettings({ hideBuiltIn: value })
                }
              />
            )}
          />
          <Divider style={styles.divider} />
          <List.Item
            title={t.browseCatalog}
            description={`${builtInCount} / ${catalogTotal}`}
            left={(props) => (
              <List.Icon {...props} icon="view-grid-plus-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/catalog")}
          />
        </Card.Content>
      </Card>

      {/* System Integration (native only) */}
      {Platform.OS !== "web" && (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.systemIntegration}
          </Text>
          <List.Item
            title={t.notifications}
            description={t.notificationsDesc}
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
            title={t.backgroundMonitoring}
            description={t.backgroundMonitoringDesc}
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
            title={t.hapticFeedback}
            description={t.hapticFeedbackDesc}
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
      )}

      {/* Stats */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.statistics}
          </Text>
          <List.Item
            title={t.catalogResources}
            description={t.fromCatalog}
            right={() => <Text variant="bodyLarge">{builtInCount}</Text>}
          />
          <Divider />
          <List.Item
            title={t.customResources}
            description={t.manuallyAdded}
            right={() => <Text variant="bodyLarge">{customCount}</Text>}
          />
          <Divider />
          <List.Item
            title={t.totalActive}
            right={() => <Text variant="bodyLarge">{resources.length}</Text>}
          />
          <Divider />
          <List.Item
            title={t.availableInCatalog}
            right={() => <Text variant="bodyLarge">{catalogTotal}</Text>}
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
          {t.resetToDefaults}
        </Button>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          {t.resetDesc}
        </Text>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          NetProbe v1.5.3{"\n"}
          {t.appTagline}
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
