import type { CheckResult, ResourceStatus } from '../types';
import { lookupGeo } from "./geoLookup";

const CONTROLLER_MAP = new Map<string, AbortController>();

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";

const HEAD_RETRY_CODES = new Set([403, 405, 406]);

export const checkResource = async (
  url: string,
  timeout: number = 10000,
  resourceId?: string,
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
    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    };

    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers,
      redirect: "follow",
    });

    // Retry with GET if the server rejects HEAD
    if (HEAD_RETRY_CODES.has(response.status)) {
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers,
        redirect: "follow",
      });
    }

    const latency = Date.now() - startTime;
    const status = deriveStatus(response.status, latency, timeout);
    console.log(
      `[NetProbe] ${url} -> ${status} (${response.status}) ${latency}ms`,
    );

    // Fire-and-forget geo lookup (non-blocking)
    const geo = await lookupGeo(url).catch(() => null);

    return {
      status,
      latency,
      statusCode: response.status,
      timestamp: Date.now(),
      resolvedIp: geo?.ip,
      countryCode: geo?.countryCode,
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

const deriveStatus = (
  statusCode: number,
  latency: number,
  timeout: number,
): ResourceStatus => {
  if (latency >= timeout) return 'timeout';
  if (statusCode >= 200 && statusCode < 400) return 'online';
  if (statusCode === 403 || statusCode === 451) return 'blocked';
  if (statusCode >= 500) return 'error';
  return 'offline';
};

const deriveErrorStatus = (message: string): ResourceStatus => {
  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'offline';
  }
  if (lower.includes('dns') || lower.includes('getaddrinfo')) {
    return 'dns_failure';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'timeout';
  }
  if (lower.includes('blocked') || lower.includes('forbidden')) {
    return 'blocked';
  }
  return 'error';
};

export const checkMultipleResources = async (
  urls: { id: string; url: string }[],
  timeout: number = 10000,
): Promise<Map<string, CheckResult>> => {
  const results = new Map<string, CheckResult>();
  const checks = urls.map(async ({ id, url }) => {
    const result = await checkResource(url, timeout, id);
    results.set(id, result);
  });
  await Promise.allSettled(checks);
  return results;
};
