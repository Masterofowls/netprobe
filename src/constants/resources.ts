import type { CatalogEntry, Resource } from "../types";
import { DEFAULT_ENABLED_IDS, RESOURCE_CATALOG } from "./catalog";

export const catalogToResource = (entry: CatalogEntry): Resource => ({
  id: entry.id,
  name: entry.name,
  url: entry.url,
  icon: entry.icon,
  color: entry.color,
  isBuiltIn: true,
  category: entry.category,
  history: [],
});

export const DEFAULT_RESOURCES: Resource[] = RESOURCE_CATALOG.filter((e) =>
  DEFAULT_ENABLED_IDS.includes(e.id),
).map(catalogToResource);

export const DEFAULT_SETTINGS = {
  refreshInterval: 30000,
  autoRefresh: true,
  theme: "system" as const,
  timeout: 10000,
  maxHistoryItems: 50,
  notificationsEnabled: true,
  backgroundCheckEnabled: false,
  hapticFeedback: true,
  hideBuiltIn: false,
  enabledCatalogIds: DEFAULT_ENABLED_IDS,
  language: "en" as const,
  pinnedIds: [] as string[],
  sortMode: "default" as const,
};
