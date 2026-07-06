import { invoke } from "@tauri-apps/api/core";
import type { CheckOptions, CheckResult, ResourceStatus } from "@core/types";
import type { DnsResult, KeywordResult, TlsResult } from "@core/types";
import { mergeDeepCheckStatus } from "../lib/checkUtils";

const CONTROLLERS = new Map<string, AbortController>();

export const checkResource = async (
  url: string,
  timeout = 10000,
  resourceId?: string,
  options: CheckOptions = {},
): Promise<CheckResult> => {
  console.log(`[NetProbe] Checking ${url}...`);

  if (resourceId) {
    CONTROLLERS.get(resourceId)?.abort();
  }

  const controller = new AbortController();
  if (resourceId) CONTROLLERS.set(resourceId, controller);

  const start = Date.now();

  try {
    const statusCode = await invoke<number>("probe_http", {
      targetUrl: url,
      timeoutMs: timeout,
    });

    if (controller.signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const latency = Date.now() - start;
    let status = deriveStatus(statusCode, latency, timeout);

    const [dns, tls, keyword, geo] = await Promise.all([
      options.enableDns
        ? invoke<DnsResult>("probe_dns", { targetUrl: url })
        : Promise.resolve(undefined),
      options.enableTls
        ? invoke<TlsResult>("probe_tls", { targetUrl: url })
        : Promise.resolve(undefined),
      options.keyword
        ? invoke<KeywordResult>("probe_keyword", {
            targetUrl: url,
            keyword: options.keyword,
            timeoutMs: timeout,
          })
        : Promise.resolve(undefined),
      invoke<{ ip?: string; countryCode?: string }>("probe_geo", {
        targetUrl: url,
      }).catch(() => ({ ip: undefined, countryCode: undefined })),
    ]);

    status = mergeDeepCheckStatus(status, dns, tls, keyword);

    console.log(`[NetProbe] ${url} -> ${status} (${statusCode}) ${latency}ms`);

    return {
      status,
      latency,
      statusCode,
      timestamp: Date.now(),
      resolvedIp: geo.ip ?? dns?.addresses[0],
      countryCode: geo.countryCode,
      dns,
      tls,
      keyword,
    };
  } catch (error) {
    const latency = Date.now() - start;
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        status: latency >= timeout * 0.9 ? "timeout" : "unknown",
        latency: latency >= timeout * 0.9 ? latency : null,
        statusCode: null,
        timestamp: Date.now(),
        errorMessage:
          latency >= timeout * 0.9
            ? `Request timed out after ${timeout}ms`
            : "Request cancelled",
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      status: deriveErrorStatus(message),
      latency,
      statusCode: null,
      timestamp: Date.now(),
      errorMessage: message,
    };
  } finally {
    if (resourceId) CONTROLLERS.delete(resourceId);
  }
};

const deriveStatus = (
  statusCode: number,
  latency: number,
  timeout: number,
): ResourceStatus => {
  if (latency >= timeout) return "timeout";
  if (statusCode >= 200 && statusCode < 400) return "online";
  if (statusCode === 403 || statusCode === 451) return "blocked";
  if (statusCode >= 500) return "error";
  return "offline";
};

const deriveErrorStatus = (message: string): ResourceStatus => {
  const lower = message.toLowerCase();
  if (lower.includes("network") || lower.includes("failed")) return "offline";
  if (lower.includes("dns") || lower.includes("getaddrinfo")) return "dns_failure";
  if (lower.includes("timeout") || lower.includes("timed out")) return "timeout";
  if (lower.includes("blocked") || lower.includes("forbidden")) return "blocked";
  return "error";
};
