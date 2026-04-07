export type ResourceStatus =
  | 'online'
  | 'offline'
  | 'timeout'
  | 'dns_failure'
  | 'blocked'
  | 'error'
  | 'checking'
  | 'unknown';

export interface CheckResult {
  status: ResourceStatus;
  latency: number | null;
  statusCode: number | null;
  timestamp: number;
  errorMessage?: string;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isBuiltIn: boolean;
  category?: string;
  lastCheck?: CheckResult;
  history: CheckResult[];
}

export interface AppSettings {
  refreshInterval: number;
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'system';
  timeout: number;
  maxHistoryItems: number;
}
