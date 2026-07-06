import { Platform } from "react-native";
import type { DnsResult, KeywordResult, TlsResult } from "../types";

const parseProxyJson = async <T>(response: Response): Promise<T> => {
  const rawBody = await response.text();
  try {
    return rawBody ? (JSON.parse(rawBody) as T) : ({} as T);
  } catch {
    throw new Error(rawBody.slice(0, 120) || `Probe failed (${response.status})`);
  }
};

const callProbeApi = async (
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<Response> => {
  const query = new URLSearchParams(params).toString();
  return fetch(`/api/check?${query}`, { signal });
};

export const checkDns = async (
  url: string,
  signal?: AbortSignal,
): Promise<DnsResult> => {
  const hostname = new URL(url).hostname;
  const start = Date.now();

  if (Platform.OS === "web") {
    try {
      const response = await callProbeApi({ mode: "dns", url }, signal);
      const payload = await parseProxyJson<DnsResult & { error?: string }>(response);
      if (!response.ok) {
        return {
          resolved: false,
          addresses: [],
          latencyMs: Date.now() - start,
          error: payload.error ?? "DNS probe failed",
        };
      }
      return payload;
    } catch (error) {
      return {
        resolved: false,
        addresses: [],
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : "DNS probe failed",
      };
    }
  }

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
      { signal },
    );
    const data = await response.json();
    const addresses =
      data.Answer?.filter((a: { type: number }) => a.type === 1).map(
        (a: { data: string }) => a.data,
      ) ?? [];

    return {
      resolved: addresses.length > 0,
      addresses,
      latencyMs: Date.now() - start,
      error: addresses.length === 0 ? "No A records found" : undefined,
    };
  } catch (error) {
    return {
      resolved: false,
      addresses: [],
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "DNS lookup failed",
    };
  }
};

export const checkTls = async (
  url: string,
  signal?: AbortSignal,
): Promise<TlsResult> => {
  const hostname = new URL(url).hostname;

  if (Platform.OS === "web") {
    try {
      const response = await callProbeApi({ mode: "tls", url }, signal);
      const payload = await parseProxyJson<TlsResult & { error?: string }>(response);
      if (!response.ok) {
        return { valid: false, error: payload.error ?? "TLS probe failed" };
      }
      return payload;
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "TLS probe failed",
      };
    }
  }

  try {
    const queries = [`%.${hostname}`, hostname];
    for (const query of queries) {
      const response = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(query)}&output=json`,
        { signal },
      );
      if (!response.ok) continue;

      const certs = (await response.json()) as Array<{
        issuer_name?: string;
        not_after?: string;
      }>;

      if (!Array.isArray(certs) || certs.length === 0) continue;

      const latest = certs.reduce((best, cert) => {
        const expiry = cert.not_after ? new Date(cert.not_after).getTime() : 0;
        const bestExpiry = best.not_after ? new Date(best.not_after).getTime() : 0;
        return expiry > bestExpiry ? cert : best;
      }, certs[0]);

      const expiresAt = latest.not_after
        ? new Date(latest.not_after).getTime()
        : undefined;
      const daysUntilExpiry = expiresAt
        ? Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        valid: expiresAt ? expiresAt > Date.now() : true,
        issuer: latest.issuer_name,
        expiresAt,
        daysUntilExpiry,
      };
    }

    return {
      valid: true,
      skipped: true,
      error: "Certificate lookup unavailable",
    };
  } catch (error) {
    return {
      valid: true,
      skipped: true,
      error: error instanceof Error ? error.message : "TLS check failed",
    };
  }
};

export const checkKeyword = async (
  url: string,
  keyword: string,
  timeout: number,
  signal?: AbortSignal,
): Promise<KeywordResult> => {
  if (!keyword.trim()) {
    return { matched: true, keyword, error: "No keyword configured" };
  }

  if (Platform.OS === "web") {
    try {
      const response = await callProbeApi(
        { mode: "keyword", url, keyword, timeout: String(timeout) },
        signal,
      );
      const payload = await parseProxyJson<KeywordResult & { error?: string }>(
        response,
      );
      if (!response.ok) {
        return { matched: false, keyword, error: payload.error ?? "Keyword probe failed" };
      }
      return payload;
    } catch (error) {
      return {
        matched: false,
        keyword,
        error: error instanceof Error ? error.message : "Keyword probe failed",
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const linked = signal
      ? (() => {
          signal.addEventListener("abort", () => controller.abort());
          return controller.signal;
        })()
      : controller.signal;

    const response = await fetch(url, {
      method: "GET",
      signal: linked,
      headers: { Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    const body = (await response.text()).slice(0, 500_000);
    const matched = body.toLowerCase().includes(keyword.toLowerCase());
    return { matched, keyword };
  } catch (error) {
    return {
      matched: false,
      keyword,
      error: error instanceof Error ? error.message : "Keyword check failed",
    };
  }
};

export const mergeDeepCheckStatus = (
  httpStatus: import("../types").ResourceStatus,
  dns?: DnsResult,
  tls?: TlsResult,
  keyword?: KeywordResult,
): import("../types").ResourceStatus => {
  if (httpStatus !== "online") return httpStatus;

  // Only downgrade when the deep check succeeded with a definitive failure.
  if (dns && !dns.resolved && !dns.error) return "dns_failure";
  if (tls && !tls.valid && !tls.error && !tls.skipped) return "error";
  if (keyword?.keyword && !keyword.matched && !keyword.error) return "error";

  return "online";
};
