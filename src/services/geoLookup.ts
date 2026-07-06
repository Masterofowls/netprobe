import { Platform } from "react-native";

export interface GeoInfo {
  ip: string;
  countryCode: string;
}

const cache = new Map<string, GeoInfo>();

const countryFlags: Record<string, string> = {};


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


export const lookupGeo = async (url: string): Promise<GeoInfo | null> => {
  // ip-api.com blocks browser requests (403); DNS data is shown from deep checks instead.
  if (Platform.OS === "web") return null;

  try {
    const hostname = new URL(url).hostname;
    if (cache.has(hostname)) return cache.get(hostname)!;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://ip-api.com/json/${hostname}?fields=query,countryCode`,
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
