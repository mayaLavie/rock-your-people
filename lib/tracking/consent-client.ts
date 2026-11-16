"use client";

import { getCookieConsent, setCookieConsent } from "@/lib/cookie-consent";
import { revokePixel } from "./pixel";
import { resetPageViewGuard } from "./revoke-state";
import { resetViewContent } from "./viewcontent";

const CONSENT_ROUTE = "/api/consent";
const SYNC_KEY = "ryp-consent-synced";

/** Accept: the server sets the signed consent cookie first, then the UI state flips (the pixel mounts). */
export async function acceptConsent(): Promise<void> {
  try {
    const res = await fetch(CONSENT_ROUTE, { method: "POST", credentials: "same-origin" });
    if (res.ok) window.sessionStorage.setItem(SYNC_KEY, "1");
  } catch {
    // Offline or blocked: the browser pixel still works; server events will be refused.
  }
  setCookieConsent("accepted");
}

/**
 * A returning visitor who accepted earlier: make sure the signed cookie exists (it expires after
 * 6 months, and storage may have outlived it). Once per tab session.
 */
export async function ensureConsentCookie(): Promise<void> {
  if (getCookieConsent() !== "accepted") return;
  try {
    if (window.sessionStorage.getItem(SYNC_KEY)) return;
    const res = await fetch(CONSENT_ROUTE, { method: "POST", credentials: "same-origin" });
    if (res.ok) window.sessionStorage.setItem(SYNC_KEY, "1");
  } catch {
    // ignore
  }
}

/** Stops tracking in place (no reload): server cookie, pixel script, _fbp/_fbc, one-shot guards. */
export function stopTracking(): void {
  try {
    window.sessionStorage.removeItem(SYNC_KEY);
  } catch {
    // ignore
  }
  fetch(CONSENT_ROUTE, { method: "DELETE", credentials: "same-origin", keepalive: true }).catch(
    () => {},
  );
  revokePixel();
  resetPageViewGuard();
  resetViewContent();
}
