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
