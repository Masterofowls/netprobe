import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
  AnimatedFAB,
  Appbar,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ResourceCard } from '../src/components/ResourceCard';
import { StatusSummary } from '../src/components/StatusSummary';
import { useAutoRefresh } from '../src/hooks/useAutoRefresh';
import { useAppStore } from '../src/store/useAppStore';
import { hapticLight } from "../src/services/haptics";
import type { Resource } from "../src/types";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    resources,
    isChecking,
    checkAllResources,
    lastFullCheck,
    networkState,
    settings,
    getVisibleResources,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isExtended, setIsExtended] = React.useState(true);

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

  const renderItem = useCallback(
    ({ item }: { item: Resource }) => (
      <ResourceCard
        resource={item}
        onPress={() => {
          if (settings.hapticFeedback) hapticLight().catch(() => {});
          router.push(`/resource/${item.id}`);
        }}
      />
    ),
    [router, settings.hapticFeedback],
  );

  const lastCheckTime = lastFullCheck
    ? new Date(lastFullCheck).toLocaleTimeString()
    : "Never";

  const networkLabel =
    networkState.isConnected === false ? "Offline" : `Last: ${lastCheckTime}`;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header elevated>
        <Appbar.Content title="NetProbe" subtitle={networkLabel} />
        <Appbar.Action
          icon="refresh"
          onPress={checkAllResources}
          disabled={isChecking}
        />
        <Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search resources..."
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
              {searchQuery
                ? "No resources match your search"
                : "No resources configured"}
            </Text>
          </View>
        }
      />

      <AnimatedFAB
        icon="plus"
        label="Add Resource"
        extended={isExtended}
        onPress={() => router.push("/add-resource")}
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        color={theme.colors.onPrimaryContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    paddingTop: 48,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    borderRadius: 16,
  },
});
