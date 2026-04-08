export interface GeoInfo {
  ip: string;
  countryCode: string;
}

const cache = new Map<string, GeoInfo>();

const countryFlags: Record<string, string> = {};

/**
 * Convert a 2-letter ISO country code to a flag emoji.
 * Uses regional indicator symbols: 🇺🇸 = \uD83C\uDDFA\uD83C\uDDF8
 */
export const countryCodeToFlag = (code: string): string => {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  if (countryFlags[upper]) return countryFlags[upper];
  const flag = String.fromCodePoint(
    ...Array.from(upper).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
  countryFlags[upper] = flag;
  return flag;
};

/**
 * Resolve IP + country for a given URL hostname.
 * Uses ip-api.com (free, no key, 45 req/min).
 */
export const lookupGeo = async (url: string): Promise<GeoInfo | null> => {
  try {
    const hostname = new URL(url).hostname;
    if (cache.has(hostname)) return cache.get(hostname)!;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `http://ip-api.com/json/${hostname}?fields=query,countryCode`,
      { signal: controller.signal },
    );
    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json();
    if (data.query && data.countryCode) {
      const info: GeoInfo = {
        ip: data.query,
        countryCode: data.countryCode,
      };
      cache.set(hostname, info);
      return info;
    }
    return null;
  } catch {
    return null;
  }
};
