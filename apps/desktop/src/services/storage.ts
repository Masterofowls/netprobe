import { invoke } from "@tauri-apps/api/core";

const STORAGE = {
  resources: "@netprobe_resources",
  settings: "@netprobe_settings",
};

export const loadStorage = async (): Promise<{
  resources: string | null;
  settings: string | null;
}> => {
  const data = await invoke<{ resources?: string; settings?: string }>(
    "load_persisted_data",
  );
  return {
    resources: data.resources ?? null,
    settings: data.settings ?? null,
  };
};

export const saveResources = async (json: string): Promise<void> => {
  const current = await loadStorage();
  await invoke("save_persisted_data", {
    resources: json,
    settings: current.settings,
  });
};

export const saveSettings = async (json: string): Promise<void> => {
  const current = await loadStorage();
  await invoke("save_persisted_data", {
    resources: current.resources,
    settings: json,
  });
};

export const clearStorage = async (): Promise<void> => {
  await invoke("save_persisted_data", {
    resources: null,
    settings: null,
  });
};

export { STORAGE };
