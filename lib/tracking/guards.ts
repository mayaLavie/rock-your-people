import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Server-side guards shared by /api/meta/event, /api/lead and /api/consent.
 * Node runtime only (node:crypto).
 */

export const CONSENT_COOKIE = "ryp_consent";
const CONSENT_MAX_AGE_S = 60 * 60 * 24 * 183; // about 6 months

/** True in `next dev` and in the test build (NEXT_PUBLIC_E2E=1). Never in a real production build. */
function isRelaxedEnv(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "1";
}

let warnedAboutSecret = false;

function consentSecret(): string | null {
  const secret = process.env.CONSENT_COOKIE_SECRET?.trim();
  if (secret) return secret;
  if (!isRelaxedEnv()) return null; // production without a secret: fail closed
  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      "[consent] CONSENT_COOKIE_SECRET is not set; using an insecure dev-only fallback. Set it before deploying.",
    );
  }
  return "dev-only-insecure-consent-secret";
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

/** Cookie value `granted.<issuedAtSeconds>.<hmac>`, or null when no secret is available. */
export function createConsentValue(nowSeconds = Math.floor(Date.now() / 1000)): string | null {
  const secret = consentSecret();
  if (!secret) return null;
  const payload = `granted.${nowSeconds}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyConsentValue(value: string | undefined): boolean {
  if (!value) return false;
  const secret = consentSecret();
  if (!secret) return false;
  const match = /^granted\.(\d{9,11})\.([A-Za-z0-9_-]{20,64})$/.exec(value);
  if (!match) return false;
  const age = Math.floor(Date.now() / 1000) - Number(match[1]);
  if (age < -60 || age > CONSENT_MAX_AGE_S) return false;
  const expected = Buffer.from(sign(`granted.${match[1]}`, secret));
  const given = Buffer.from(match[2]);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function readCookieHeader(headers: Headers, name: string): string | undefined {
  const raw = headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export function hasValidConsent(request: Request): boolean {
  return verifyConsentValue(readCookieHeader(request.headers, CONSENT_COOKIE));
}

function isHttps(request: Request): boolean {
  if (request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https") return true;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Set-Cookie header for the consent cookie. `value` null clears it. */
export function consentSetCookie(request: Request, value: string | null): string {
  const parts = [
    `${CONSENT_COOKIE}=${value ?? ""}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${value ? CONSENT_MAX_AGE_S : 0}`,
  ];
  if (process.env.NODE_ENV === "production" && isHttps(request)) parts.push("Secure");
  return parts.join("; ");
}

/* ---------- Origin / Referer allowlist ---------- */

function allowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://rockyourpeople.com";
  try {
    const host = new URL(site).host.toLowerCase();
    hosts.add(host);
    hosts.add(host.startsWith("www.") ? host.slice(4) : `www.${host}`);
  } catch {
    // ignore a malformed site url
  }
  return hosts;
}

function hostAllowed(urlLike: string): boolean {
  let u: URL;
  try {
    u = new URL(urlLike);
  } catch {
    return false;
  }
  if (isRelaxedEnv() && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true;
  return allowedHosts().has(u.host.toLowerCase());
}

/**
 * Browsers always send Origin on cross-origin and POST requests, and Referer as a fallback.
 * A request with neither, or with a foreign one, is rejected.
 */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== "null") return hostAllowed(origin);
  const referer = request.headers.get("referer");
  if (referer) return hostAllowed(referer);
  return false;
}

/* ---------- Client IP ---------- */

/**
 * Trusted-proxy order: `x-vercel-forwarded-for` (set by Vercel's edge, cannot be spoofed by the
 * client), then `x-real-ip`, then `x-forwarded-for` read from the RIGHT: the entry appended by our own
 * proxy chain, never the leftmost value the client can forge. TRUSTED_PROXY_HOPS (default 1) is the
 * number of proxies in front of the app.
 */
export function clientIp(headers: Headers): string | undefined {
  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const list = xff.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
    const ip = list[Math.max(0, list.length - hops)];
    if (ip) return ip;
  }
  return undefined;
}

/* ---------- In-memory rate limit (per server instance) ---------- */

type Bucket = { count: number; resetAt: number };
const globalStore = globalThis as unknown as { __rypRateLimit?: Map<string, Bucket> };

/**
 * Fixed-window counter per key. In-memory: each serverless instance counts on its own, so this is
 * a speed bump against floods, not an exact quota. Requests with no determinable client IP share one
 * bucket in production; the test build skips loopback/unknown addresses so parallel tests do not starve
 * each other.
 */
export function rateLimited(
  route: string,
  ip: string | undefined,
  limit: number,
  windowMs = 60_000,
): boolean {
  if (process.env.NEXT_PUBLIC_E2E === "1" && (!ip || /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(ip))) {
    return false; // test build: every local request shares the loopback address
  }
  const store = (globalStore.__rypRateLimit ??= new Map());
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
  }
  const key = `${route}:${ip ?? "unknown"}`;
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

/* ---------- Body ---------- */

/** Reads the body as text; null when it is larger than maxChars (checked on Content-Length first). */
export async function readCappedText(request: Request, maxChars: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxChars * 3) return null;
  const text = await request.text();
  return text.length > maxChars ? null : text;
}

/* ---------- event_source_url ---------- */

/** Origin + path + utm_* only. fbclid and every other query parameter are dropped; hash removed. */
export function cleanSourceUrl(raw: string): string | null {
  if (raw.length > 2000) return null;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const keep = new URLSearchParams();
  u.searchParams.forEach((v, k) => {
    if (/^utm_[a-z]{1,20}$/.test(k)) keep.append(k, v.slice(0, 200));
  });
  const query = keep.toString();
  return `${u.origin}${u.pathname}${query ? `?${query}` : ""}`;
}
