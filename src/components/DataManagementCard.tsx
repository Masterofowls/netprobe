import React, { useState } from "react";
import { Alert, Platform, Share, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Portal,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { useAppStore } from "../store/useAppStore";
import { useT } from "../hooks/useTranslation";
import {
  buildStatusShareText,
  createBackup,
  downloadBackupOnWeb,
  parseBackup,
  serializeBackup,
} from "../services/dataExport";

export const DataManagementCard: React.FC = () => {
  const t = useT();
  const { resources, settings, importBackup } = useAppStore();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const customResources = resources.filter((resource) => !resource.isBuiltIn);
  const backup = createBackup(customResources, settings);

  const handleExport = async () => {
    if (Platform.OS === "web") {
      downloadBackupOnWeb(backup);
      return;
    }

    await Share.share({
      title: "NetProbe Backup",
      message: serializeBackup(backup),
    });
  };

  const handleShareStatus = async () => {
    const message = buildStatusShareText(resources);
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      Alert.alert(t.shareStatus, t.copiedToClipboard);
      return;
    }

    await Share.share({ message, title: t.shareStatus });
  };

  const handleImport = async () => {
    try {
      const parsed = parseBackup(importText);
      await importBackup(parsed);
      setImportOpen(false);
      setImportText("");
      Alert.alert(t.importBackup, t.importSuccess);
    } catch (error) {
      Alert.alert(
        t.importBackup,
        error instanceof Error ? error.message : t.importFailed,
      );
    }
  };

  const handleWebFileImport = async (
    event: { target: { files?: FileList | null; value: string } },
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setImportText(text);
    setImportOpen(true);
    event.target.value = "";
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t.dataManagement}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.description, { opacity: 0.75 }]}
        >
          {t.dataManagementDesc}
        </Text>

        <View style={styles.actions}>
          <Button mode="contained-tonal" icon="export" onPress={handleExport}>
            {t.exportBackup}
          </Button>
          <Button mode="outlined" icon="import" onPress={() => setImportOpen(true)}>
            {t.importBackup}
          </Button>
          <Button mode="outlined" icon="share-variant" onPress={handleShareStatus}>
            {t.shareStatus}
          </Button>
        </View>

        {Platform.OS === "web" && (
          <View style={styles.webImport}>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleWebFileImport}
              style={{ color: "inherit" }}
            />
          </View>
        )}
      </Card.Content>

      <Portal>
        <Dialog visible={importOpen} onDismiss={() => setImportOpen(false)}>
          <Dialog.Title>{t.importBackup}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              {t.importBackupDesc}
            </Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={8}
              value={importText}
              onChangeText={setImportText}
              placeholder='{ "version": 1, ... }'
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportOpen(false)}>{t.cancel}</Button>
            <Button onPress={handleImport} disabled={!importText.trim()}>
              {t.importBackup}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
};

export const DeepChecksCard: React.FC<{
  settings: ReturnType<typeof useAppStore.getState>["settings"];
  updateSettings: ReturnType<typeof useAppStore.getState>["updateSettings"];
}> = ({ settings, updateSettings }) => {
  const t = useT();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t.deepChecks}
        </Text>
        <Text variant="bodyMedium" style={[styles.description, { opacity: 0.75 }]}>
          {t.deepChecksDesc}
        </Text>

        <View style={styles.switchRow}>
          <Text variant="bodyLarge">{t.dnsCheck}</Text>
          <Switch
            value={settings.enableDnsCheck}
            onValueChange={(value) => updateSettings({ enableDnsCheck: value })}
          />
        </View>
        <View style={styles.switchRow}>
          <Text variant="bodyLarge">{t.tlsCheck}</Text>
          <Switch
            value={settings.enableTlsCheck}
            onValueChange={(value) => updateSettings({ enableTlsCheck: value })}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  actions: {
    gap: 10,
  },
  webImport: {
    marginTop: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
