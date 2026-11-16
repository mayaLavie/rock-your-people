"use client";

import { getCookieConsent } from "@/lib/cookie-consent";
import { readAttribution, readCookie } from "./attribution";
import { CAPI_ROUTE, META_PIXEL_ID, type MetaEventName } from "./config";

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

  try {
    window.fbq?.("track", eventName, customData, { eventID: eventId });
  } catch {
    // A broken pixel must never break the page.
  }

  sendToServer({
    consent: true,
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
