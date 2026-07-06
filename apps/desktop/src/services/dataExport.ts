import type { AppSettings, NetProbeBackup, Resource } from "@core/types";
import { isOfflineStatus } from "../lib/checkUtils";

const BACKUP_VERSION = 1 as const;

export const createBackup = (
  customResources: Resource[],
  settings: AppSettings,
): NetProbeBackup => ({
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  customResources: customResources.map((resource) => ({
    ...resource,
    lastCheck: undefined,
    history: [],
  })),
  settings,
});

export const serializeBackup = (backup: NetProbeBackup): string =>
  JSON.stringify(backup, null, 2);

export const parseBackup = (raw: string): NetProbeBackup => {
  const parsed = JSON.parse(raw) as NetProbeBackup;
  if (parsed.version !== BACKUP_VERSION) {
    throw new Error("Unsupported backup version");
  }
  if (!parsed.settings || !Array.isArray(parsed.customResources)) {
    throw new Error("Invalid backup format");
  }
  return parsed;
};

export const buildStatusShareText = (resources: Resource[]): string => {
  const online = resources.filter((r) => r.lastCheck?.status === "online").length;
  const offline = resources.filter((r) =>
    r.lastCheck ? isOfflineStatus(r.lastCheck.status) : false,
  ).length;
  const total = resources.length;
  const timestamp = new Date().toLocaleString();

  const lines = [
    `NetProbe Status — ${timestamp}`,
    `${online}/${total} online · ${offline} issues`,
    "",
  ];

  for (const resource of resources) {
    const status = resource.lastCheck?.status ?? "unknown";
    const latency = resource.lastCheck?.latency;
    const latencyLabel = latency != null ? ` (${latency}ms)` : "";
    lines.push(`• ${resource.name}: ${status.toUpperCase()}${latencyLabel}`);
  }

  lines.push("", "NetProbe Desktop");
  return lines.join("\n");
};
