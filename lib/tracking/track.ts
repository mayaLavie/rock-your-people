"use client";

import { getCookieConsent } from "@/lib/cookie-consent";
import { readAttribution, readCookie } from "./attribution";
import { toInternationalDigits } from "./phone";
import { readCtaPlacement } from "./placement";
import {
  CAPI_ROUTE,
  LEAD_CURRENCY,
  LEAD_VALUE,
  META_PIXEL_ID,
  type MetaEventName,
} from "./config";

export type TrackParams = Record<string, string | number | boolean | undefined>;

export type TrackUserData = {
  /** Raw phone; hashed server-side only. */
  phone?: string;
  /** Raw first name; hashed server-side only. */
  firstName?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackingEnabled(): boolean {
  if (typeof window === "undefined" || !META_PIXEL_ID) return false;
  return getCookieConsent() === "accepted";
}

export function newEventId(): string {
  return crypto.randomUUID();
}

function advancedMatching(userData?: TrackUserData): Record<string, string> | undefined {
  if (!userData) return undefined;
  const out: Record<string, string> = {};
  if (userData.phone) {
    const ph = toInternationalDigits(userData.phone);
    if (ph.length >= 8) out.ph = ph;
  }
  const fn = userData.firstName
    ?.trim()
    .toLowerCase()
    .split(/\s+/)[0]
    ?.replace(/[^\p{L}\p{N}]/gu, "");
  if (fn) out.fn = fn;
  return Object.keys(out).length ? out : undefined;
}

function sendToServer(body: unknown) {
  const json = JSON.stringify(body);
  try {
    if (
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(
        CAPI_ROUTE,
        new Blob([json], { type: "application/json" }),
      )
    ) {
      return;
    }
  } catch {
    // fall through to fetch
  }
  fetch(CAPI_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Fires one event to the browser pixel AND the server Conversions API with the
 * same event_id (so Meta de-duplicates). Does nothing without consent or pixel id.
 * Returns the event id, or null when nothing was sent.
 */
export function track(
  eventName: MetaEventName,
  params: TrackParams = {},
  options: { eventId?: string; userData?: TrackUserData } = {},
): string | null {
  if (!trackingEnabled()) return null;
  const eventId = options.eventId ?? newEventId();

  const customData: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(readAttribution().utm)) {
    if (v) customData[k] = v;
  }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) customData[k] = v;
  }
  if (eventName === "Lead" || eventName === "Contact") {
    const placement = readCtaPlacement();
    if (placement) customData.cta_placement = placement;
  }
  // Only when NEXT_PUBLIC_LEAD_VALUE is set; nothing is invented otherwise.
  if (eventName === "Lead" && LEAD_VALUE !== undefined) {
    customData.value = LEAD_VALUE;
    customData.currency = LEAD_CURRENCY;
  }

  try {
    // Browser advanced matching (form mode only): the pixel hashes these itself. Done before the
    // track call so the Lead carries them; the server sends the hashed pair too, with the same event_id.
    const matching = advancedMatching(options.userData);
    if (matching) window.fbq?.("init", META_PIXEL_ID, matching);
    window.fbq?.("track", eventName, customData, { eventID: eventId });
  } catch {
    // A broken pixel must never break the page.
  }

  sendToServer({
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    custom_data: customData,
    user_data: {
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
      ph: options.userData?.phone,
      fn: options.userData?.firstName,
    },
  });
  return eventId;
}
