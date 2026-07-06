const HEAD_RETRY_CODES = new Set([403, 405, 406]);
const USER_AGENT =
  "Mozilla/5.0 (compatible; NetProbe/1.5; +https://netprobe.expo.app)";

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const readQueryParam = (value) => (Array.isArray(value) ? value[0] : value);

const probeHttp = async (targetUrl, timeoutMs) => {
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

const probeDns = async (targetUrl) => {
  const hostname = new URL(targetUrl).hostname;
  const start = Date.now();
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
    );
    const data = await response.json();
    const addresses =
      data.Answer?.filter((entry) => entry.type === 1).map((entry) => entry.data) ??
      [];

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

const probeTls = async (targetUrl) => {
  const hostname = new URL(targetUrl).hostname;
  const queries = [`%.${hostname}`, hostname];

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(query)}&output=json`,
      );
      if (!response.ok) continue;

      const certs = await response.json();
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
      // try next query
    }
  }

  return {
    valid: true,
    skipped: true,
    error: "Certificate lookup unavailable",
  };
};

const probeKeyword = async (targetUrl, keyword, timeoutMs) => {
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const mode = readQueryParam(req.query.mode) ?? "http";
  const targetUrl = readQueryParam(req.query.url);
  const keyword = readQueryParam(req.query.keyword) ?? "";
  const timeoutMs = Math.min(
    Math.max(Number(readQueryParam(req.query.timeout)) || 10000, 1000),
    30000,
  );

  if (!targetUrl || !isValidUrl(targetUrl)) {
    return res.status(400).json({ error: "Invalid or missing url parameter" });
  }

  try {
    if (mode === "dns") {
      return res.status(200).json(await probeDns(targetUrl));
    }

    if (mode === "tls") {
      return res.status(200).json(await probeTls(targetUrl));
    }

    if (mode === "keyword") {
      if (!keyword.trim()) {
        return res.status(400).json({ error: "Missing keyword parameter" });
      }
      return res.status(200).json(await probeKeyword(targetUrl, keyword, timeoutMs));
    }

    return res.status(200).json(await probeHttp(targetUrl, timeoutMs));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proxy request failed";
    const status =
      error instanceof Error && error.name === "AbortError" ? 408 : 502;
    return res.status(status).json({ error: message });
  }
}
