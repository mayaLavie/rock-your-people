import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/*
 * Server-side guards shared by /api/meta/event, /api/lead and /api/consent.
 * Node runtime only (node:crypto).
 */

export const CONSENT_COOKIE = "ryp_consent";
const CONSENT_MAX_AGE_S = 60 * 60 * 24 * 183; // about 6 months

/** Loopback host names (with or without a port) that only a local machine can be addressed by. */
function isLoopbackHost(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const first = raw.split(",")[0].trim().toLowerCase();
  if (first === "::1") return true;
  const host = first.startsWith("[") ? first.slice(1, first.indexOf("]")) : first.replace(/:\d+$/, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/** The request is addressed to a loopback host (Host header; a forwarded host must be loopback too). */
function isLoopbackRequest(request: Request | undefined): boolean {
  if (!request) return false;
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded && !isLoopbackHost(forwarded)) return false;
  return isLoopbackHost(request.headers.get("host"));
}

/** NEXT_PUBLIC_E2E is set to anything at all (it must never be set on a real deployment). */
export function e2eFlagSet(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_E2E?.trim());
}

/** Running on Vercel (any environment). */
export function onVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

/**
 * True in `next dev`, and in the test build only when ALL hold: NEXT_PUBLIC_E2E=1, not on Vercel, and
 * the request itself is addressed to a loopback host. A real deployment can never be relaxed, even if
 * NEXT_PUBLIC_E2E leaks into its environment. Calls without a request are never relaxed in a build.
 */
function isRelaxedEnv(request?: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.NEXT_PUBLIC_E2E === "1" && !onVercel() && isLoopbackRequest(request);
}

let warnedAboutSecret = false;

function consentSecret(request?: Request): string | null {
  const secret = process.env.CONSENT_COOKIE_SECRET?.trim();
  if (secret) return secret;
  if (!isRelaxedEnv(request)) return null; // production without a secret: fail closed
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

/**
 * Cookie value `granted.<issuedAtSeconds>.<nonce>.<hmac>`, or null when no secret is available.
 * The random nonce makes every issued cookie distinct (it identifies a visitor behind a shared IP).
 */
export function createConsentValue(
  nowSeconds = Math.floor(Date.now() / 1000),
  request?: Request,
): string | null {
  const secret = consentSecret(request);
  if (!secret) return null;
  const payload = `granted.${nowSeconds}.${randomBytes(8).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyConsentValue(value: string | undefined, request?: Request): boolean {
  if (!value) return false;
  const secret = consentSecret(request);
  if (!secret) return false;
  const match = /^granted\.(\d{9,11})\.([A-Za-z0-9_-]{8,16})\.([A-Za-z0-9_-]{20,64})$/.exec(value);
  if (!match) return false;
  const age = Math.floor(Date.now() / 1000) - Number(match[1]);
  if (age < -60 || age > CONSENT_MAX_AGE_S) return false;
  const expected = Buffer.from(sign(`granted.${match[1]}.${match[2]}`, secret));
  const given = Buffer.from(match[3]);
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
  return verifyConsentValue(readCookieHeader(request.headers, CONSENT_COOKIE), request);
}

/**
 * Identifier of the visitor's consent cookie (its signature part), or undefined when the cookie is
 * missing or invalid. Used to tell visitors apart behind one shared IP (an office on NAT).
 */
export function consentId(request: Request): string | undefined {
  const value = readCookieHeader(request.headers, CONSENT_COOKIE);
  if (!verifyConsentValue(value, request)) return undefined;
  return value!.split(".").slice(2).join(".");
}

/** What the secret setup looks like, without revealing any value. */
export function consentSecretStatus(request?: Request): "configured" | "dev-fallback" | "missing" {
  if (process.env.CONSENT_COOKIE_SECRET?.trim()) return "configured";
  return isRelaxedEnv(request) ? "dev-fallback" : "missing";
}

let warnedMissingSecret = false;

/** One loud log line when production runs without CONSENT_COOKIE_SECRET (server events are off). */
export function warnIfConsentSecretMissing(): void {
  if (warnedMissingSecret || consentSecretStatus() !== "missing") return;
  warnedMissingSecret = true;
  console.error("[tracking] CONSENT_COOKIE_SECRET missing — server events are disabled");
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

function hostAllowed(urlLike: string, request: Request): boolean {
  let u: URL;
  try {
    u = new URL(urlLike);
  } catch {
    return false;
  }
  if (isRelaxedEnv(request) && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true;
  return allowedHosts().has(u.host.toLowerCase());
}

/**
 * Browsers always send Origin on cross-origin and POST requests, and Referer as a fallback.
 * A request with neither, or with a foreign one, is rejected.
 */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== "null") return hostAllowed(origin, request);
  const referer = request.headers.get("referer");
  if (referer) return hostAllowed(referer, request);
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
  /** Optional second key part (for example the consent-cookie id) within the same IP. */
  sub?: string,
): boolean {
  if (process.env.NEXT_PUBLIC_E2E === "1" && !onVercel() && (!ip || /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(ip))) {
    return false; // test build: every local request shares the loopback address
  }
  const store = (globalStore.__rypRateLimit ??= new Map());
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
  }
  const key = `${route}:${ip ?? "unknown"}${sub ? `|${sub}` : ""}`;
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
