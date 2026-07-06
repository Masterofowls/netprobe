import { create } from "zustand";
import { RESOURCE_CATALOG } from "@core/constants/catalog";
import {
  catalogToResource,
  DEFAULT_RESOURCES,
  DEFAULT_SETTINGS,
} from "@core/constants/resources";
import type {
  AppSettings,
  CheckOptions,
  CheckResult,
  NetProbeBackup,
  NetworkState,
  Resource,
} from "@core/types";
import { checkResource } from "../services/networkChecker";
import {
  clearStorage,
  loadStorage,
  saveResources,
  saveSettings,
} from "../services/storage";
import { isOfflineStatus } from "../lib/checkUtils";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

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

const notify = async (title: string, body: string) => {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === "granted";
    }
    if (granted) {
      await sendNotification({ title, body });
    }
  } catch {
    // notifications optional on desktop
  }
};

interface AppState {
  resources: Resource[];
  settings: AppSettings;
  isChecking: boolean;
  lastFullCheck: number | null;
  networkState: NetworkState;
  ready: boolean;

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
    isConnected: navigator.onLine,
    type: "desktop",
    isInternetReachable: navigator.onLine,
    details: null,
  },
  ready: false,

  loadData: async () => {
    try {
      console.log("[NetProbe] Loading persisted data...");
      const { resources: resourcesJson, settings: settingsJson } =
        await loadStorage();

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
        ready: true,
      });
      console.log(
        `[NetProbe] Loaded ${builtIn.length} catalog + ${customResources.length} custom resources`,
      );
    } catch {
      console.warn("[NetProbe] Failed to load data, using defaults");
      set({ ready: true });
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
    await saveResources(JSON.stringify(customResources));
    set({ resources: [...resources, newResource] });
  },

  updateResource: async (id, updates) => {
    const { resources } = get();
    const updated = resources.map((r) =>
      r.id === id ? { ...r, ...updates } : r,
    );
    const customResources = updated.filter((r) => !r.isBuiltIn);
    await saveResources(JSON.stringify(customResources));
    set({ resources: updated });
  },

  deleteResource: async (id) => {
    const { resources } = get();
    const filtered = resources.filter((r) => r.id !== id);
    const customResources = filtered.filter((r) => !r.isBuiltIn);
    await saveResources(JSON.stringify(customResources));
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

    if (settings.notificationsEnabled && previousStatus) {
      const wasOnline = previousStatus === "online";
      const isNowOffline = isOfflineStatus(result.status);
      const isNowOnline = result.status === "online";

      if (wasOnline && isNowOffline) {
        notify(
          `${resource.name} is down`,
          `${resource.url} — ${result.status}`,
        );
      } else if (
        !wasOnline &&
        isNowOnline &&
        isOfflineStatus(previousStatus)
      ) {
        notify(`${resource.name} recovered`, resource.url);
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

    await Promise.allSettled(
      resources.map(async (resource) => {
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
      }),
    );

    set({ isChecking: false, lastFullCheck: Date.now() });
  },

  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    await saveSettings(JSON.stringify(newSettings));
    set({ settings: newSettings });
  },

  resetToDefaults: async () => {
    await clearStorage();
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
    await saveSettings(JSON.stringify(newSettings));

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
    await saveSettings(JSON.stringify(newSettings));

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
    await saveSettings(JSON.stringify(newSettings));
    set({ settings: newSettings });
  },

  getVisibleResources: () => {
    const { resources, settings } = get();
    let list = settings.hideBuiltIn
      ? resources.filter((r) => !r.isBuiltIn)
      : resources;

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

    await saveResources(JSON.stringify(customResources));
    await saveSettings(JSON.stringify(mergedSettings));

    const builtIn = buildBuiltInResources(mergedSettings.enabledCatalogIds);
    set({
      settings: mergedSettings,
      resources: [...builtIn, ...customResources],
    });
  },
}));
