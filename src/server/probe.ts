const HEAD_RETRY_CODES = new Set([403, 405, 406]);
const USER_AGENT =
  "Mozilla/5.0 (compatible; NetProbe/1.5; +https://netprobe.expo.app)";

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const probeHttp = async (targetUrl: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml",
  };

  try {
    let response = await fetch(targetUrl, {
      method: "HEAD",
      signal: controller.signal,
      headers,
      redirect: "follow",
    });

    if (HEAD_RETRY_CODES.has(response.status)) {
      response = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        headers,
        redirect: "follow",
      });
    }

    return { status: response.status, ok: response.ok };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const probeDns = async (targetUrl: string) => {
  const hostname = new URL(targetUrl).hostname;
  const start = Date.now();

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
    );
    const data = await response.json();
    const addresses =
      data.Answer?.filter((entry: { type: number }) => entry.type === 1).map(
        (entry: { data: string }) => entry.data,
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
      addresses: [] as string[],
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "DNS lookup failed",
    };
  }
};

export const probeTls = async (targetUrl: string) => {
  const hostname = new URL(targetUrl).hostname;
  const queries = [`%.${hostname}`, hostname];

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(query)}&output=json`,
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
    } catch {
      // try next query format
    }
  }

  return {
    valid: true,
    skipped: true,
    error: "Certificate lookup unavailable",
  };
};

export const probeKeyword = async (
  targetUrl: string,
  keyword: string,
  timeoutMs: number,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    const body = (await response.text()).slice(0, 500_000);
    const matched = body.toLowerCase().includes(keyword.toLowerCase());
    return { matched, keyword };
  } catch (error) {
    return {
      matched: false,
      keyword,
      error: error instanceof Error ? error.message : "Keyword check failed",
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const parseProbeQuery = (searchParams: URLSearchParams) => {
  const mode = searchParams.get("mode") ?? "http";
  const targetUrl = searchParams.get("url");
  const keyword = searchParams.get("keyword") ?? "";
  const timeoutMs = Math.min(
    Math.max(Number(searchParams.get("timeout")) || 10000, 1000),
    30000,
  );

  return { mode, targetUrl, keyword, timeoutMs };
};

export const parseProbeRequest = (request: Request) =>
  parseProbeQuery(new URL(request.url).searchParams);

export const validateTargetUrl = (targetUrl: string | null) =>
  Boolean(targetUrl && isValidUrl(targetUrl));
