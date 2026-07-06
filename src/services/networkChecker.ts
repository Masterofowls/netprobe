import { Platform } from "react-native";
import type { CheckOptions, CheckResult, ResourceStatus } from "../types";
import {
  checkDns,
  checkKeyword,
  checkTls,
  mergeDeepCheckStatus,
} from "./deepCheck";
import { lookupGeo } from "./geoLookup";

const CONTROLLER_MAP = new Map<string, AbortController>();

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";

const HEAD_RETRY_CODES = new Set([403, 405, 406]);

export const checkResource = async (
  url: string,
  timeout: number = 10000,
  resourceId?: string,
  options: CheckOptions = {},
): Promise<CheckResult> => {
  console.log(`[NetProbe] Checking ${url}...`);
  if (resourceId) {
    const existing = CONTROLLER_MAP.get(resourceId);
    if (existing) {
      existing.abort();
    }
  }

  const controller = new AbortController();
  if (resourceId) {
    CONTROLLER_MAP.set(resourceId, controller);
  }

  const startTime = Date.now();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const statusCode = await fetchStatusCode(url, timeout, controller.signal);
    const checkLatency = Date.now() - startTime;
    let status = deriveStatus(statusCode, checkLatency, timeout);

    const [dns, tls, keyword] = await Promise.all([
      options.enableDns
        ? checkDns(url, controller.signal)
        : Promise.resolve(undefined),
      options.enableTls
        ? checkTls(url, controller.signal)
        : Promise.resolve(undefined),
      options.keyword
        ? checkKeyword(url, options.keyword, timeout, controller.signal)
        : Promise.resolve(undefined),
    ]);

    status = mergeDeepCheckStatus(status, dns, tls, keyword);

    console.log(
      `[NetProbe] ${url} -> ${status} (${statusCode}) ${checkLatency}ms`,
    );

    const geo = await lookupGeo(url).catch(() => null);

    return {
      status,
      latency: checkLatency,
      statusCode,
      timestamp: Date.now(),
      resolvedIp: geo?.ip ?? dns?.addresses[0],
      countryCode: geo?.countryCode,
      dns,
      tls,
      keyword,
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;

    if (error instanceof Error && error.name === "AbortError") {
      if (latency >= timeout * 0.9) {
        return {
          status: "timeout",
          latency,
          statusCode: null,
          timestamp: Date.now(),
          errorMessage: `Request timed out after ${timeout}ms`,
        };
      }
      return {
        status: "unknown",
        latency: null,
        statusCode: null,
        timestamp: Date.now(),
        errorMessage: "Request cancelled",
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const status = deriveErrorStatus(errorMessage);
    console.error(`[NetProbe] ${url} -> ERROR: ${status} - ${errorMessage}`);

    return {
      status,
      latency,
      statusCode: null,
      timestamp: Date.now(),
      errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
    if (resourceId) {
      CONTROLLER_MAP.delete(resourceId);
    }
  }
};

const fetchStatusCode = async (
  url: string,
  timeout: number,
  signal: AbortSignal,
): Promise<number> => {
  if (Platform.OS === "web") {
    const proxyUrl = `/api/check?url=${encodeURIComponent(url)}&timeout=${timeout}&mode=http`;
    const response = await fetch(proxyUrl, { signal });
    const rawBody = await response.text();
    let payload: { status?: number; error?: string } = {};

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      throw new Error(
        rawBody.slice(0, 120) || `Proxy check failed (${response.status})`,
      );
    }

    if (!response.ok || payload.status == null) {
      throw new Error(payload.error ?? `Proxy check failed (${response.status})`);
    }

    return payload.status;
  }

  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml",
  };

  let response = await fetch(url, {
    method: "HEAD",
    signal,
    headers,
    redirect: "follow",
  });

  if (HEAD_RETRY_CODES.has(response.status)) {
    response = await fetch(url, {
      method: "GET",
      signal,
      headers,
      redirect: "follow",
    });
  }

  return response.status;
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
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "offline";
  }
  if (lower.includes("dns") || lower.includes("getaddrinfo")) {
    return "dns_failure";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "timeout";
  }
  if (lower.includes("blocked") || lower.includes("forbidden")) {
    return "blocked";
  }
  return "error";
};

export const checkMultipleResources = async (
  urls: { id: string; url: string; options?: CheckOptions }[],
  timeout: number = 10000,
): Promise<Map<string, CheckResult>> => {
  const results = new Map<string, CheckResult>();
  const checks = urls.map(async ({ id, url, options }) => {
    const result = await checkResource(url, timeout, id, options);
    results.set(id, result);
  });
  await Promise.allSettled(checks);
  return results;
};
