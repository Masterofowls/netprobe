import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  List,
  Text,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from "expo-linking";
import { DeepCheckPanel } from "../../src/components/DeepCheckPanel";
import { LatencyChart } from "../../src/components/LatencyChart";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAppStore } from "../../src/store/useAppStore";
import { useT } from "../../src/hooks/useTranslation";
import { countryCodeToFlag } from "../../src/services/geoLookup";

export default function ResourceDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resources, checkSingleResource, deleteResource } = useAppStore();
  const t = useT();

  const resource = resources.find((r) => r.id === id);

  useEffect(() => {
    if (id) {
      checkSingleResource(id);
    }
  }, [id, checkSingleResource]);

  const handleDelete = useCallback(async () => {
    if (resource && !resource.isBuiltIn) {
      await deleteResource(resource.id);
      router.back();
    }
  }, [resource, deleteResource, router]);

  if (!resource) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="headlineSmall">Resource not found</Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          {t.goBack}
        </Button>
      </View>
    );
  }

  const lastCheck = resource.lastCheck;
  const status = lastCheck?.status ?? "unknown";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Card */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content style={styles.headerContent}>
          <View
            style={[
              styles.iconLarge,
              { backgroundColor: `${resource.color}20` },
            ]}
          >
            <Icon source={resource.icon} size={40} color={resource.color} />
          </View>
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
              {resource.name}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {resource.url}
            </Text>
            <View style={styles.chips}>
              {resource.category && (
                <Chip compact style={styles.chip}>
                  {resource.category}
                </Chip>
              )}
              <Chip compact style={styles.chip}>
                {resource.isBuiltIn ? t.builtIn : t.custom}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Status Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.currentStatus}
          </Text>
          <View style={styles.statusRow}>
            <StatusBadge status={status} size="medium" />
            {lastCheck?.latency !== null &&
              lastCheck?.latency !== undefined && (
                <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
                  {lastCheck.latency}ms
                </Text>
              )}
          </View>
          {lastCheck?.statusCode && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
            >
              {t.httpStatus}: {lastCheck.statusCode}
            </Text>
          )}
          {lastCheck?.errorMessage && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.error, marginTop: 8 }}
            >
              {lastCheck.errorMessage}
            </Text>
          )}
          {lastCheck?.timestamp && (
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
            >
              {t.lastChecked}: {new Date(lastCheck.timestamp).toLocaleString()}
            </Text>
          )}
          {lastCheck?.resolvedIp && (
            <View style={styles.geoRow}>
              {lastCheck.countryCode && (
                <Text variant="bodyLarge">
                  {countryCodeToFlag(lastCheck.countryCode)}
                </Text>
              )}
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {lastCheck.resolvedIp}
                {lastCheck.countryCode ? ` (${lastCheck.countryCode})` : ""}
              </Text>
            </View>
          )}
          <DeepCheckPanel
            check={lastCheck}
            labels={{
              deepChecks: t.deepChecks,
              dns: t.dnsCheck,
              tls: t.tlsCheck,
              keyword: t.keywordCheck,
              certExpires: t.certExpires,
              daysLeft: t.daysLeft,
              notResolved: t.notResolved,
              invalidCert: t.invalidCert,
              keywordMissing: t.keywordMissing,
              keywordFound: t.keywordFound,
            }}
          />
        </Card.Content>
      </Card>

      {/* Latency Chart */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t.responseHistory}
          </Text>
          <LatencyChart history={resource.history} />
        </Card.Content>
      </Card>

      {/* History Log */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Check History
          </Text>
          {resource.history.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t.noHistory}
            </Text>
          ) : (
            resource.history.slice(0, 10).map((entry, index) => (
              <React.Fragment key={`${entry.timestamp}-${index}`}>
                <List.Item
                  title={entry.status.toUpperCase()}
                  description={`${entry.latency ?? "-"}ms • HTTP ${entry.statusCode ?? "-"}`}
                  right={() => (
                    <Text variant="labelSmall" style={{ alignSelf: "center" }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Text>
                  )}
                  left={() => <StatusBadge status={entry.status} />}
                />
                {index < Math.min(resource.history.length, 10) - 1 && (
                  <Divider />
                )}
              </React.Fragment>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained-tonal"
          onPress={() => Linking.openURL(resource.url)}
          icon="open-in-new"
          style={styles.actionButton}
        >
          {t.openInBrowser}
        </Button>
        <Button
          mode="contained"
          onPress={() => checkSingleResource(resource.id)}
          icon="refresh"
          style={styles.actionButton}
        >
          {t.recheck}
        </Button>
        {!resource.isBuiltIn && (
          <Button
            mode="outlined"
            onPress={handleDelete}
            icon="delete"
            textColor={theme.colors.error}
            style={styles.actionButton}
          >
            {t.deleteResource}
          </Button>
        )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    margin: 16,
    borderRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  iconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    height: 28,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
  },
  geoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
});
