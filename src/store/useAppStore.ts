import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { RESOURCE_CATALOG } from "../constants/catalog";
import {
  catalogToResource,
  DEFAULT_RESOURCES,
  DEFAULT_SETTINGS,
} from "../constants/resources";
import { checkResource } from "../services/networkChecker";
import {
  isOfflineStatus,
  notifyResourceDown,
  notifyResourceRecovered,
} from "../services/notificationService";
import { hapticForStatus } from "../services/haptics";
import { updateWidgetData } from "../services/widgetBridge";
import type {
  AppSettings,
  CheckOptions,
  CheckResult,
  NetProbeBackup,
  NetworkState,
  Resource,
  SortMode,
} from "../types";

const STORAGE_KEYS = {
  RESOURCES: "@netprobe_resources",
  SETTINGS: "@netprobe_settings",
};

const getCheckOptions = (
  resource: Resource,
  settings: AppSettings,
): CheckOptions => ({
  enableDns: settings.enableDnsCheck,
  enableTls: settings.enableTlsCheck,
  keyword: resource.keyword,
});

const buildBuiltInResources = (enabledIds: string[]): Resource[] =>
  RESOURCE_CATALOG.filter((e) => enabledIds.includes(e.id)).map(
    catalogToResource,
  );

interface AppState {
  resources: Resource[];
  settings: AppSettings;
  isChecking: boolean;
  lastFullCheck: number | null;
  networkState: NetworkState;

  loadData: () => Promise<void>;
  addResource: (
    resource: Omit<Resource, "id" | "isBuiltIn" | "history">,
  ) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  checkSingleResource: (id: string) => Promise<void>;
  checkAllResources: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  setNetworkState: (state: NetworkState) => void;
  toggleCatalogResource: (id: string) => Promise<void>;
  setCatalogResources: (ids: string[]) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  getVisibleResources: () => Resource[];
  importBackup: (backup: NetProbeBackup) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  resources: DEFAULT_RESOURCES,
  settings: DEFAULT_SETTINGS,
  isChecking: false,
  lastFullCheck: null,
  networkState: {
    isConnected: null,
    type: null,
    isInternetReachable: null,
    details: null,
  },

  loadData: async () => {
    try {
      console.log("[NetProbe] Loading persisted data...");
      const [resourcesJson, settingsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RESOURCES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      const customResources: Resource[] = resourcesJson
        ? JSON.parse(resourcesJson)
        : [];
      const savedSettings: Partial<AppSettings> = settingsJson
        ? JSON.parse(settingsJson)
        : {};

      const mergedSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
      const builtIn = buildBuiltInResources(mergedSettings.enabledCatalogIds);

      set({
        resources: [...builtIn, ...customResources],
        settings: mergedSettings,
      });
      console.log(
        `[NetProbe] Loaded ${builtIn.length} catalog + ${customResources.length} custom resources`,
      );
    } catch {
      console.warn("[NetProbe] Failed to load data, using defaults");
    }
  },

  addResource: async (resource) => {
    const newResource: Resource = {
      ...resource,
      id: `custom_${Date.now()}`,
      isBuiltIn: false,
      history: [],
    };

    const { resources } = get();
    const customResources = [
      ...resources.filter((r) => !r.isBuiltIn),
      newResource,
    ];

    await AsyncStorage.setItem(
      STORAGE_KEYS.RESOURCES,
      JSON.stringify(customResources),
    );

    set({ resources: [...resources, newResource] });
  },

  updateResource: async (id, updates) => {
    const { resources } = get();
    const updated = resources.map((r) =>
      r.id === id ? { ...r, ...updates } : r,
    );

    const customResources = updated.filter((r) => !r.isBuiltIn);
    await AsyncStorage.setItem(
      STORAGE_KEYS.RESOURCES,
      JSON.stringify(customResources),
    );

    set({ resources: updated });
  },

  deleteResource: async (id) => {
    const { resources } = get();
    const filtered = resources.filter((r) => r.id !== id);

    const customResources = filtered.filter((r) => !r.isBuiltIn);
    await AsyncStorage.setItem(
      STORAGE_KEYS.RESOURCES,
      JSON.stringify(customResources),
    );

    set({ resources: filtered });
  },

  checkSingleResource: async (id) => {
    const { resources, settings } = get();
    const resource = resources.find((r) => r.id === id);
    if (!resource) return;

    const previousStatus = resource.lastCheck?.status;

    set({
      resources: resources.map((r) =>
        r.id === id
          ? {
              ...r,
              lastCheck: { ...r.lastCheck, status: "checking" } as CheckResult,
            }
          : r,
      ),
    });

    const result = await checkResource(
      resource.url,
      settings.timeout,
      resource.id,
      getCheckOptions(resource, settings),
    );

    const updatedResource = {
      ...resource,
      lastCheck: result,
      history: [result, ...resource.history].slice(0, settings.maxHistoryItems),
    };

    set({
      resources: get().resources.map((r) =>
        r.id === id ? updatedResource : r,
      ),
    });

    // Haptic feedback
    if (settings.hapticFeedback) {
      hapticForStatus(result.status).catch(() => {});
    }

    // Notifications for status changes
    if (settings.notificationsEnabled && previousStatus) {
      const wasOnline = previousStatus === "online";
      const isNowOffline = isOfflineStatus(result.status);
      const isNowOnline = result.status === "online";

      if (wasOnline && isNowOffline) {
        notifyResourceDown(updatedResource).catch(() => {});
      } else if (!wasOnline && isNowOnline && isOfflineStatus(previousStatus)) {
        notifyResourceRecovered(updatedResource).catch(() => {});
      }
    }
  },

  checkAllResources: async () => {
    const { resources, settings, isChecking } = get();
    if (isChecking) return;

    console.log(`[NetProbe] Checking all ${resources.length} resources...`);
    set({ isChecking: true });

    set({
      resources: resources.map((r) => ({
        ...r,
        lastCheck: {
          status: "checking",
          latency: null,
          statusCode: null,
          timestamp: Date.now(),
        },
      })),
    });

    const checks = resources.map(async (resource) => {
      const result = await checkResource(
        resource.url,
        settings.timeout,
        resource.id,
        getCheckOptions(resource, settings),
      );
      set({
        resources: get().resources.map((r) =>
          r.id === resource.id
            ? {
                ...r,
                lastCheck: result,
                history: [result, ...r.history].slice(
                  0,
                  settings.maxHistoryItems,
                ),
              }
            : r,
        ),
      });
    });

    await Promise.allSettled(checks);

    const finalResources = get().resources;
    const online = finalResources.filter(
      (r) => r.lastCheck?.status === "online",
    ).length;
    const offline = finalResources.filter((r) =>
      r.lastCheck ? isOfflineStatus(r.lastCheck.status) : false,
    ).length;

    // Update widget with latest data
    updateWidgetData(
      online,
      offline,
      finalResources.length,
      finalResources,
    ).catch(() => {});

    // Haptic feedback for overall result
    if (settings.hapticFeedback) {
      if (offline > 0) {
        hapticForStatus("error").catch(() => {});
      } else {
        hapticForStatus("online").catch(() => {});
      }
    }

    set({ isChecking: false, lastFullCheck: Date.now() });
  },

  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(newSettings),
    );
    set({ settings: newSettings });
  },

  resetToDefaults: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.RESOURCES);
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
    set({
      resources: DEFAULT_RESOURCES,
      settings: DEFAULT_SETTINGS,
    });
  },

  setNetworkState: (state) => set({ networkState: state }),

  toggleCatalogResource: async (id) => {
    const { settings, resources } = get();
    const isEnabled = settings.enabledCatalogIds.includes(id);
    const newIds = isEnabled
      ? settings.enabledCatalogIds.filter((i) => i !== id)
      : [...settings.enabledCatalogIds, id];

    const newSettings = { ...settings, enabledCatalogIds: newIds };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(newSettings),
    );

    const customResources = resources.filter((r) => !r.isBuiltIn);
    const builtIn = buildBuiltInResources(newIds);

    set({
      settings: newSettings,
      resources: [...builtIn, ...customResources],
    });
  },

  setCatalogResources: async (ids) => {
    const { settings, resources } = get();
    const newSettings = { ...settings, enabledCatalogIds: ids };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(newSettings),
    );

    const customResources = resources.filter((r) => !r.isBuiltIn);
    const builtIn = buildBuiltInResources(ids);

    set({
      settings: newSettings,
      resources: [...builtIn, ...customResources],
    });
  },

  togglePin: async (id) => {
    const { settings } = get();
    const isPinned = settings.pinnedIds.includes(id);
    const newPins = isPinned
      ? settings.pinnedIds.filter((i) => i !== id)
      : [...settings.pinnedIds, id];

    const newSettings = { ...settings, pinnedIds: newPins };
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(newSettings),
    );
    set({ settings: newSettings });
  },

  getVisibleResources: () => {
    const { resources, settings } = get();
    let list = settings.hideBuiltIn
      ? resources.filter((r) => !r.isBuiltIn)
      : resources;

    // Sort
    const statusOrder: Record<string, number> = {
      online: 0,
      checking: 1,
      unknown: 2,
      timeout: 3,
      blocked: 4,
      dns_failure: 5,
      error: 6,
      offline: 7,
    };

    if (settings.sortMode === "status") {
      list = [...list].sort((a, b) => {
        const sa = statusOrder[a.lastCheck?.status ?? "unknown"] ?? 2;
        const sb = statusOrder[b.lastCheck?.status ?? "unknown"] ?? 2;
        return sa - sb;
      });
    } else if (settings.sortMode === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Pinned always on top
    const pinned = list.filter((r) => settings.pinnedIds.includes(r.id));
    const unpinned = list.filter((r) => !settings.pinnedIds.includes(r.id));
    return [...pinned, ...unpinned];
  },

  importBackup: async (backup) => {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...backup.settings };
    const customResources = backup.customResources.map((resource) => ({
      ...resource,
      isBuiltIn: false,
    }));

    await AsyncStorage.setItem(
      STORAGE_KEYS.RESOURCES,
      JSON.stringify(customResources),
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(mergedSettings),
    );

    const builtIn = buildBuiltInResources(mergedSettings.enabledCatalogIds);
    set({
      settings: mergedSettings,
      resources: [...builtIn, ...customResources],
    });
  },
}));
