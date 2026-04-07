import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { DEFAULT_RESOURCES, DEFAULT_SETTINGS } from '../constants/resources';
import { checkResource } from '../services/networkChecker';
import type { AppSettings, CheckResult, Resource } from '../types';

const STORAGE_KEYS = {
  RESOURCES: '@netprobe_resources',
  SETTINGS: '@netprobe_settings',
};

interface AppState {
  resources: Resource[];
  settings: AppSettings;
  isChecking: boolean;
  lastFullCheck: number | null;

  loadData: () => Promise<void>;
  addResource: (resource: Omit<Resource, 'id' | 'isBuiltIn' | 'history'>) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  checkSingleResource: (id: string) => Promise<void>;
  checkAllResources: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  resources: DEFAULT_RESOURCES,
  settings: DEFAULT_SETTINGS,
  isChecking: false,
  lastFullCheck: null,

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

      set({
        resources: [...DEFAULT_RESOURCES, ...customResources],
        settings: { ...DEFAULT_SETTINGS, ...savedSettings },
      });
      console.log(
        `[NetProbe] Loaded ${customResources.length} custom resources`,
      );
    } catch {
      console.warn('[NetProbe] Failed to load data, using defaults');
      // Use defaults on error
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

    set({
      resources: resources.map((r) =>
        r.id === id
          ? { ...r, lastCheck: { ...r.lastCheck, status: 'checking' } as CheckResult }
          : r,
      ),
    });

    const result = await checkResource(
      resource.url,
      settings.timeout,
      resource.id,
    );

    set({
      resources: get().resources.map((r) =>
        r.id === id
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
  },

  checkAllResources: async () => {
    const { resources, settings, isChecking } = get();
    if (isChecking) return;

    console.log(`[NetProbe] Checking all ${resources.length} resources...`);
    set({ isChecking: true });

    set({
      resources: resources.map((r) => ({
        ...r,
        lastCheck: { status: 'checking', latency: null, statusCode: null, timestamp: Date.now() },
      })),
    });

    const checks = resources.map(async (resource) => {
      const result = await checkResource(
        resource.url,
        settings.timeout,
        resource.id,
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
}));
