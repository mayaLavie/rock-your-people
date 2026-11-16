import { consentSecretStatus, warnIfConsentSecretMissing } from "@/lib/tracking/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deploy check for the band: is server-side (Conversions API) tracking set up? Reports a state and a
 * reason only; it never returns a token, a secret or any other value.
 *   ready    - consent secret, pixel id and access token are all set; events go to Meta
 *   dry-run  - consent works but no access token: events are accepted and not sent
 *   disabled - server events cannot run (missing secret or pixel id)
 */
export async function GET() {
  warnIfConsentSecretMissing();
  const secret = consentSecretStatus();
  const pixel = Boolean((process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim());
  const token = Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim());

  let capi: "ready" | "dry-run" | "disabled";
  let reason: string;
  if (secret === "missing") {
    capi = "disabled";
    reason = "CONSENT_COOKIE_SECRET missing — server events are disabled";
  } else if (!pixel) {
    capi = "disabled";
    reason = "NEXT_PUBLIC_META_PIXEL_ID missing — server events are disabled";
  } else if (!token) {
    capi = "dry-run";
    reason = "META_CAPI_ACCESS_TOKEN missing — events are accepted but not sent to Meta";
  } else {
    capi = "ready";
    reason = secret === "dev-fallback" ? "ready (dev-only consent secret in use)" : "ready";
  }
  return Response.json(
    { capi, reason },
    { headers: { "cache-control": "no-store" } },
  );
}
