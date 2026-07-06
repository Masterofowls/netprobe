import type { ResourceStatus, DnsResult, KeywordResult, TlsResult } from "@core/types";

export const isOfflineStatus = (status: ResourceStatus): boolean =>
  status === "offline" ||
  status === "timeout" ||
  status === "dns_failure" ||
  status === "blocked" ||
  status === "error";

export const mergeDeepCheckStatus = (
  httpStatus: ResourceStatus,
  dns?: DnsResult,
  tls?: TlsResult,
  keyword?: KeywordResult,
): ResourceStatus => {
  if (httpStatus !== "online") return httpStatus;
  if (dns && !dns.resolved && !dns.error) return "dns_failure";
  if (tls && !tls.valid && !tls.error && !tls.skipped) return "error";
  if (keyword?.keyword && !keyword.matched && !keyword.error) return "error";
  return "online";
};
