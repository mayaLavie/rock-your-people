import {
  cleanSourceUrl,
  clientIp,
  hasValidConsent,
  originAllowed,
  rateLimited,
  readCappedText,
} from "@/lib/tracking/guards";
import {
  graphVersion,
  hashFirstName,
  hashPhone,
  isAllowedEvent,
  sanitizeCustomData,
} from "@/lib/tracking/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 10_000;
const EVENTS_PER_MINUTE = 30;
const COOKIE_VALUE = /^fb\.\d\.\d{10,13}\.[\w.-]{1,512}$/;

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/**
 * Meta Conversions API relay. Guards, in order: Origin/Referer allowlist, per-IP rate limit
 * (30/min), signed consent cookie (set by /api/consent), body size cap, event-name whitelist. Browser sends the same event (same event_id) as
 * the pixel; Meta de-duplicates. Raw phone / name are hashed here and never logged.
 */
export async function POST(request: Request) {
  if (!originAllowed(request)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  const ip = clientIp(request.headers);
  if (rateLimited("meta-event", ip, EVENTS_PER_MINUTE)) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }
  // Consent is verified from the signed first-party cookie, never from a flag in the body.
  if (!hasValidConsent(request)) return json({ ok: false, error: "consent_required" }, 403);

  const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();
  if (!pixelId) return json({ ok: false, error: "pixel_not_configured" }, 202);

  const text = await readCappedText(request, MAX_BODY_CHARS);
  if (text === null) return json({ ok: false, error: "too_large" }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  if (!isAllowedEvent(body.event_name)) {
    return json({ ok: false, error: "event_not_allowed" }, 400);
  }
  const eventId = body.event_id;
  if (typeof eventId !== "string" || !/^[\w-]{8,64}$/.test(eventId)) {
    return json({ ok: false, error: "invalid_event_id" }, 400);
  }
  const sourceUrl =
    typeof body.event_source_url === "string" ? cleanSourceUrl(body.event_source_url) : null;
  if (!sourceUrl) return json({ ok: false, error: "invalid_event_source_url" }, 400);

  const rawUser =
    body.user_data && typeof body.user_data === "object"
      ? (body.user_data as Record<string, unknown>)
      : {};
  const ph = hashPhone(rawUser.ph);
  const fn = hashFirstName(rawUser.fn);
  const fbp = typeof rawUser.fbp === "string" && COOKIE_VALUE.test(rawUser.fbp) ? rawUser.fbp : undefined;
  const fbc = typeof rawUser.fbc === "string" && COOKIE_VALUE.test(rawUser.fbc) ? rawUser.fbc : undefined;

  const userData: Record<string, unknown> = {
    client_ip_address: ip,
    client_user_agent: request.headers.get("user-agent") ?? undefined,
    fbp,
    fbc,
    ph: ph ? [ph] : undefined,
    fn: fn ? [fn] : undefined,
  };
  for (const k of Object.keys(userData)) if (userData[k] === undefined) delete userData[k];

  const clientTime = Number(body.event_time);
  const now = Math.floor(Date.now() / 1000);
  const eventTime =
    Number.isFinite(clientTime) && Math.abs(now - clientTime) < 6 * 3600 ? Math.floor(clientTime) : now;

  const event = {
    event_name: body.event_name,
    event_time: eventTime,
    event_id: eventId,
    event_source_url: sourceUrl,
    action_source: "website",
    user_data: userData,
    custom_data: sanitizeCustomData(body.custom_data),
  };
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  const payload: Record<string, unknown> = { data: [event] };
  if (testEventCode) payload.test_event_code = testEventCode;

  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[meta-capi] dry run: ${event.event_name} ${event.event_id}`);
    }
    return json({ ok: true, dryRun: true, payload }, 202);
  }

  const endpoint =
    process.env.META_CAPI_ENDPOINT?.trim() ||
    `https://graph.facebook.com/${graphVersion()}/${pixelId}/events`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[meta-capi] ${event.event_name} failed with status ${res.status}`);
      return json({ ok: false, error: "upstream_error", status: res.status }, 502);
    }
    return json({ ok: true }, 200);
  } catch {
    console.error(`[meta-capi] ${event.event_name} request failed`);
    return json({ ok: false, error: "upstream_unreachable" }, 502);
  }
}
