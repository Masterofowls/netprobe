import type { Resource, ResourceStatus } from "../types";

const OFFLINE_STATUSES: ResourceStatus[] = [
  "offline",
  "timeout",
  "dns_failure",
  "error",
];

export const isOfflineStatus = (status: ResourceStatus): boolean =>
  OFFLINE_STATUSES.includes(status);

export const setupNotifications = async (): Promise<boolean> => false;

export const notifyResourceDown = async (_resource: Resource): Promise<void> => {};

export const notifyResourceRecovered = async (
  _resource: Resource,
): Promise<void> => {};

export const notifyBatchStatus = async (
  _online: number,
  _offline: number,
  _total: number,
): Promise<void> => {};
