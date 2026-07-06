export type ResourceStatus =
  | 'online'
  | 'offline'
  | 'timeout'
  | 'dns_failure'
  | 'blocked'
  | 'error'
  | 'checking'
  | 'unknown';

export interface DnsResult {
  resolved: boolean;
  addresses: string[];
  latencyMs: number | null;
  error?: string;
}

export interface TlsResult {
  valid: boolean;
  issuer?: string;
  expiresAt?: number;
  daysUntilExpiry?: number;
  error?: string;
  skipped?: boolean;
}

export interface KeywordResult {
  matched: boolean;
  keyword: string;
  error?: string;
}

export interface CheckResult {
  status: ResourceStatus;
  latency: number | null;
  statusCode: number | null;
  timestamp: number;
  errorMessage?: string;
  resolvedIp?: string;
  countryCode?: string;
  dns?: DnsResult;
  tls?: TlsResult;
  keyword?: KeywordResult;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isBuiltIn: boolean;
  category?: string;
  keyword?: string;
  lastCheck?: CheckResult;
  history: CheckResult[];
}

export interface CatalogEntry {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  category: string;
}

export type SortMode = "default" | "status" | "name";

export interface AppSettings {
  refreshInterval: number;
  autoRefresh: boolean;
  theme: "light" | "dark" | "system";
  timeout: number;
  maxHistoryItems: number;
  notificationsEnabled: boolean;
  backgroundCheckEnabled: boolean;
  hapticFeedback: boolean;
  hideBuiltIn: boolean;
  enabledCatalogIds: string[];
  language: "en" | "ru";
  pinnedIds: string[];
  sortMode: SortMode;
  enableDnsCheck: boolean;
  enableTlsCheck: boolean;
}

export interface NetworkState {
  isConnected: boolean | null;
  type: string | null;
  isInternetReachable: boolean | null;
  details: Record<string, unknown> | null;
}

export interface NetProbeBackup {
  version: 1;
  exportedAt: string;
  customResources: Resource[];
  settings: AppSettings;
}

export interface CheckOptions {
  enableDns?: boolean;
  enableTls?: boolean;
  keyword?: string;
}
