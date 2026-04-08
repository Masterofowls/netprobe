import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  AnimatedFAB,
  Appbar,
  Button,
  Chip,
  Dialog,
  Icon,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { ResourceCard } from "../src/components/ResourceCard";
import { StatusSummary } from "../src/components/StatusSummary";
import { useAutoRefresh } from "../src/hooks/useAutoRefresh";
import { useAppStore } from "../src/store/useAppStore";
import { useT } from "../src/hooks/useTranslation";
import { hapticLight } from "../src/services/haptics";
import type { Resource, SortMode } from "../src/types";

const FAVICON_URL = (url: string) => {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
};

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const t = useT();
  const {
    resources,
    isChecking,
    checkAllResources,
    lastFullCheck,
    networkState,
    settings,
    getVisibleResources,
    updateSettings,
    addResource,
    togglePin,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isExtended, setIsExtended] = useState(true);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [quickUrl, setQuickUrl] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);

  useAutoRefresh();

  useEffect(() => {
    checkAllResources();
  }, [checkAllResources]);

  const visibleResources = getVisibleResources();

  const filteredResources = visibleResources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: { contentOffset: { y: number } } }) => {
      setIsExtended(nativeEvent.contentOffset.y <= 0);
    },
    [],
  );

  const handleQuickAdd = async () => {
    let url = quickUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
      setQuickLoading(true);
      const name =
        parsed.hostname.replace(/^www\./, "").split(".")[0] ?? "Website";
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);

      await addResource({
        name: displayName,
        url: parsed.origin,
        icon: "web",
        color: "#2196F3",
        category: "Custom",
      });

      setQuickUrl("");
      setQuickDialogOpen(false);
    } catch {
      // invalid url — ignore
    } finally {
      setQuickLoading(false);
    }
  };

  const handleSort = (mode: SortMode) => {
    updateSettings({ sortMode: mode });
    setSortMenuOpen(false);
  };

  const handleTogglePin = async (id: string) => {
    await togglePin(id);
  };

  const isPinned = (id: string) => settings.pinnedIds.includes(id);

  const renderItem = useCallback(
    ({ item }: { item: Resource }) => (
      <ResourceCard
        resource={item}
        pinned={settings.pinnedIds.includes(item.id)}
        faviconUrl={!item.isBuiltIn ? FAVICON_URL(item.url) : undefined}
        onPress={() => {
          if (settings.hapticFeedback) hapticLight().catch(() => {});
          router.push(`/resource/${item.id}`);
        }}
        onLongPress={() => handleTogglePin(item.id)}
      />
    ),
    [router, settings.hapticFeedback, settings.pinnedIds],
  );

  const lastCheckTime = lastFullCheck
    ? new Date(lastFullCheck).toLocaleTimeString()
    : t.never;

  const networkLabel =
    networkState.isConnected === false
      ? t.offline
      : `${t.lastCheck} ${lastCheckTime}`;

  const sortIcon =
    settings.sortMode === "status"
      ? "sort-bool-ascending"
      : settings.sortMode === "name"
        ? "sort-alphabetical-ascending"
        : "sort-variant";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <Icon
              source="access-point"
              size={28}
              color={theme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.headerText}>
              {t.appName}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="lightning-bolt"
              size={22}
              onPress={() => setQuickDialogOpen(true)}
              iconColor={theme.colors.primary}
            />
            <Menu
              visible={sortMenuOpen}
              onDismiss={() => setSortMenuOpen(false)}
              anchor={
                <IconButton
                  icon={sortIcon}
                  size={22}
                  onPress={() => setSortMenuOpen(true)}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              }
            >
              <Menu.Item
                onPress={() => handleSort("default")}
                title={t.sortDefault}
                leadingIcon="format-list-bulleted"
                trailingIcon={
                  settings.sortMode === "default" ? "check" : undefined
                }
              />
              <Menu.Item
                onPress={() => handleSort("status")}
                title={t.sortStatus}
                leadingIcon="sort-bool-ascending"
                trailingIcon={
                  settings.sortMode === "status" ? "check" : undefined
                }
              />
              <Menu.Item
                onPress={() => handleSort("name")}
                title={t.sortName}
                leadingIcon="sort-alphabetical-ascending"
                trailingIcon={
                  settings.sortMode === "name" ? "check" : undefined
                }
              />
            </Menu>
            <IconButton
              icon="refresh"
              size={22}
              onPress={checkAllResources}
              disabled={isChecking}
              iconColor={theme.colors.primary}
            />
            <IconButton
              icon="cog-outline"
              size={22}
              onPress={() => router.push("/settings")}
              iconColor={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>
        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginLeft: 44 }}
        >
          {networkLabel}
        </Text>
      </View>

      <Searchbar
        placeholder={t.searchResources}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={0}
      />

      <StatusSummary resources={visibleResources} />

      <FlatList
        data={filteredResources}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isChecking}
            onRefresh={checkAllResources}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {searchQuery ? t.noMatch : t.noResources}
            </Text>
          </View>
        }
      />

      <AnimatedFAB
        icon="plus"
        label={t.addResource}
        extended={isExtended}
        onPress={() => router.push("/add-resource")}
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        color={theme.colors.onPrimaryContainer}
      />

      {/* ── Quick Add Dialog ── */}
      <Portal>
        <Dialog
          visible={quickDialogOpen}
          onDismiss={() => setQuickDialogOpen(false)}
        >
          <Dialog.Title>{t.quickAdd}</Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}
            >
              {t.quickAddHint}
            </Text>
            <TextInput
              mode="outlined"
              value={quickUrl}
              onChangeText={setQuickUrl}
              placeholder={t.pasteUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoFocus
              right={
                quickUrl.trim() ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => setQuickUrl("")}
                  />
                ) : undefined
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setQuickDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onPress={handleQuickAdd}
              loading={quickLoading}
              disabled={!quickUrl.trim() || quickLoading}
              mode="contained"
            >
              {t.addWebsite}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
  },
  headerText: {
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 28,
  },
  list: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 16,
  },
});
