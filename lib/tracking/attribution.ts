/*
 * First-party campaign attribution. Captured from the URL into sessionStorage on
 * load (nothing is sent anywhere); read back only after the visitor consented.
 */

const STORAGE_KEY = "ryp-attribution";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type Attribution = {
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  fbclid?: string;
  /** ms timestamp of the capture (used as the creation time in _fbc). */
  ts?: number;
};

function clean(v: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim().slice(0, 200);
  return t || undefined;
}

export function readAttribution(): Attribution {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {
    // ignore
  }
  return { utm: {} };
}

/** Call on every full load. New campaign parameters replace the stored ones. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Attribution["utm"] = {};
    for (const key of UTM_KEYS) {
      const v = clean(params.get(key));
      if (v) utm[key] = v;
    }
    const fbclid = clean(params.get("fbclid"));
    if (!Object.keys(utm).length && !fbclid) return;
    const attribution: Attribution = { utm, fbclid, ts: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage can be blocked.
  }
}

export function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function writeCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; path=/; SameSite=Lax`;
}

/** After consent only: creates _fbc from fbclid and _fbp when missing. */
export function ensureMetaCookies(): void {
  const { fbclid, ts } = readAttribution();
  if (fbclid && !readCookie("_fbc")) {
    writeCookie("_fbc", `fb.1.${ts ?? Date.now()}.${fbclid}`);
  }
  if (!readCookie("_fbp")) {
    const rand = Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000);
    writeCookie("_fbp", `fb.1.${Date.now()}.${rand}`);
  }
}
