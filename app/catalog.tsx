import React, { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import {
  Checkbox,
  Chip,
  Divider,
  IconButton,
  List,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { CATALOG_CATEGORIES, RESOURCE_CATALOG } from "../src/constants/catalog";
import { useAppStore } from "../src/store/useAppStore";
import type { CatalogEntry } from "../src/types";

interface SectionData {
  title: string;
  data: CatalogEntry[];
}

export default function CatalogScreen() {
  const theme = useTheme();
  const { settings, toggleCatalogResource, setCatalogResources } =
    useAppStore();
  const [search, setSearch] = useState("");

  const enabledSet = useMemo(
    () => new Set(settings.enabledCatalogIds),
    [settings.enabledCatalogIds],
  );

  const sections: SectionData[] = useMemo(() => {
    const q = search.toLowerCase();
    return CATALOG_CATEGORIES.map((cat) => ({
      title: cat,
      data: RESOURCE_CATALOG.filter(
        (r) =>
          r.category === cat &&
          (r.name.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q)),
      ),
    })).filter((s) => s.data.length > 0);
  }, [search]);

  const allFilteredIds = useMemo(
    () => sections.flatMap((s) => s.data.map((r) => r.id)),
    [sections],
  );

  const allEnabled = allFilteredIds.every((id) => enabledSet.has(id));
  const noneEnabled = allFilteredIds.every((id) => !enabledSet.has(id));

  const handleSelectAll = useCallback(() => {
    if (allEnabled) {
      setCatalogResources(
        settings.enabledCatalogIds.filter((id) => !allFilteredIds.includes(id)),
      );
    } else {
      const merged = [
        ...new Set([...settings.enabledCatalogIds, ...allFilteredIds]),
      ];
      setCatalogResources(merged);
    }
  }, [
    allEnabled,
    allFilteredIds,
    settings.enabledCatalogIds,
    setCatalogResources,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: CatalogEntry }) => {
      const checked = enabledSet.has(item.id);
      return (
        <List.Item
          title={item.name}
          description={item.url}
          left={() => (
            <View style={styles.iconWrap}>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
            </View>
          )}
          right={() => (
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => toggleCatalogResource(item.id)}
            />
          )}
          onPress={() => toggleCatalogResource(item.id)}
          style={styles.item}
        />
      );
    },
    [enabledSet, toggleCatalogResource],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      const sectionIds = section.data.map((r) => r.id);
      const sectionAllEnabled = sectionIds.every((id) => enabledSet.has(id));

      const handleToggleSection = () => {
        if (sectionAllEnabled) {
          setCatalogResources(
            settings.enabledCatalogIds.filter((id) => !sectionIds.includes(id)),
          );
        } else {
          const merged = [
            ...new Set([...settings.enabledCatalogIds, ...sectionIds]),
          ];
          setCatalogResources(merged);
        }
      };

      return (
        <View
          style={[
            styles.sectionHeader,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          <Text variant="titleSmall" style={{ flex: 1, fontWeight: "700" }}>
            {section.title}
          </Text>
          <Chip
            compact
            onPress={handleToggleSection}
            style={styles.sectionChip}
          >
            {sectionAllEnabled ? "Deselect" : "Select all"}
          </Chip>
        </View>
      );
    },
    [enabledSet, settings.enabledCatalogIds, setCatalogResources, theme],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.topBar}>
        <Searchbar
          placeholder="Search catalog..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          elevation={0}
        />
        <View style={styles.bulkRow}>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {enabledSet.size} of {RESOURCE_CATALOG.length} selected
          </Text>
          <IconButton
            icon={
              allEnabled
                ? "checkbox-multiple-marked"
                : "checkbox-multiple-blank-outline"
            }
            size={20}
            onPress={handleSelectAll}
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={Divider}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  searchbar: {
    borderRadius: 28,
  },
  bulkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionChip: {
    height: 28,
  },
  item: {
    paddingVertical: 2,
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  list: {
    paddingBottom: 32,
  },
});
