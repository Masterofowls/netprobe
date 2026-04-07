import type { CheckResult, ResourceStatus } from '../types';

const CONTROLLER_MAP = new Map<string, AbortController>();

export const checkResource = async (
  url: string,
  timeout: number = 10000,
  resourceId?: string,
): Promise<CheckResult> => {
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

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NetProbe/1.0',
      },
      redirect: 'follow',
    });

    const latency = Date.now() - startTime;
    const status = deriveStatus(response.status, latency, timeout);

    return {
      status,
      latency,
      statusCode: response.status,
      timestamp: Date.now(),
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      if (latency >= timeout) {
        return {
          status: 'timeout',
          latency,
          statusCode: null,
          timestamp: Date.now(),
          errorMessage: `Request timed out after ${timeout}ms`,
        };
      }
      return {
        status: 'unknown',
        latency: null,
        statusCode: null,
        timestamp: Date.now(),
        errorMessage: 'Request cancelled',
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const status = deriveErrorStatus(errorMessage);

    return {
      status,
      latency,
      statusCode: null,
      timestamp: Date.now(),
      errorMessage,
    };
  } finally {
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
