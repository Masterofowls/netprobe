import type { ResourceStatus } from "@core/types";
import { useT } from "../hooks/useTranslation";

const STATUS_CLASS: Record<ResourceStatus, string> = {
  online: "status-online",
  offline: "status-offline",
  timeout: "status-timeout",
  dns_failure: "status-dns",
  blocked: "status-blocked",
  error: "status-error",
  checking: "status-checking",
  unknown: "status-unknown",
};

export const StatusBadge = ({ status }: { status: ResourceStatus }) => {
  const t = useT();
  const labels: Record<ResourceStatus, string> = {
    online: t.statusOnline,
    offline: t.statusOffline,
    timeout: t.statusTimeout,
    dns_failure: t.statusDnsFailure,
    blocked: t.statusBlocked,
    error: t.statusError,
    checking: t.statusChecking,
    unknown: t.statusUnknown,
  };

  return (
    <span className={`status-badge ${STATUS_CLASS[status]}`}>
      {labels[status]}
    </span>
  );
};
