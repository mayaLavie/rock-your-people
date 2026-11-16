"use client";

import { ensureMetaCookies } from "./attribution";
import { META_PIXEL_ID } from "./config";

const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";

type FbqStub = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

let initialized = false;

/**
 * Loads fbevents.js and initialises the pixel. Idempotent (StrictMode safe).
 * Must only be called after the visitor accepted cookies.
 * autoConfig=false keeps the pixel from sending automatic events (button clicks,
 * page metadata), which would double count against our explicit events.
 */
export function loadPixel(): boolean {
  if (!META_PIXEL_ID || typeof window === "undefined") return false;
  if (initialized) return true;
  initialized = true;

  ensureMetaCookies();

  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    } as FbqStub;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
    const script = document.createElement("script");
    script.async = true;
    script.src = FBEVENTS_SRC;
    document.head.appendChild(script);
  }

  window.fbq?.("set", "autoConfig", false, META_PIXEL_ID);
  window.fbq?.("init", META_PIXEL_ID);
  return true;
}

/**
 * Consent withdrawn: stop the pixel without reloading the page. Tells the pixel to revoke, removes
 * the fbevents.js script and its globals, clears _fbp/_fbc, and lets a later accept start clean.
 */
export function revokePixel(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("consent", "revoke");
  } catch {
    // ignore
  }
  document
    .querySelectorAll(`script[src^="https://connect.facebook.net/"]`)
    .forEach((el) => el.remove());
  const w = window as unknown as Record<string, unknown>;
  delete w.fbq;
  delete w._fbq;
  initialized = false;

  const host = window.location.hostname;
  const bare = host.replace(/^www\./, "");
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of [undefined, host, `.${host}`, `.${bare}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
