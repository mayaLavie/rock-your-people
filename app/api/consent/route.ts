import {
  clientIp,
  consentSetCookie,
  createConsentValue,
  originAllowed,
  rateLimited,
  warnIfConsentSecretMissing,
} from "@/lib/tracking/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body: unknown, status: number, request: Request, cookie?: string | null) {
  const headers = new Headers({ "cache-control": "no-store" });
  if (cookie !== undefined) headers.append("set-cookie", consentSetCookie(request, cookie));
  return Response.json(body, { status, headers });
}

/** The visitor accepted the cookie banner: set the signed first-party consent cookie. */
export async function POST(request: Request) {
  warnIfConsentSecretMissing();
  if (!originAllowed(request)) return reply({ ok: false, error: "origin_not_allowed" }, 403, request);
  if (rateLimited("consent", clientIp(request.headers), 20)) {
    return reply({ ok: false, error: "rate_limited" }, 429, request);
  }
  const value = createConsentValue(undefined, request);
  if (!value) {
    console.error("[consent] CONSENT_COOKIE_SECRET is not set; consent cookie not issued");
    return reply({ ok: false, error: "consent_unavailable" }, 503, request);
  }
  return reply({ ok: true }, 200, request, value);
}

/** The visitor declined or withdrew: delete the consent cookie. */
export async function DELETE(request: Request) {
  if (!originAllowed(request)) return reply({ ok: false, error: "origin_not_allowed" }, 403, request);
  return reply({ ok: true }, 200, request, null);
}
