"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking/attribution";
import { listenForCtaPlacement } from "@/lib/tracking/placement";

/**
 * Always mounted (not deferred): remembers utm_* / fbclid and the last CTA placement in
 * sessionStorage from the first moment of the visit. First-party and local only: it sends nothing and
 * sets no cookie, so consent gating is unaffected (_fbc is written only after consent, in the pixel
 * code). captureAttribution is idempotent for the same URL and the listener cleans up on unmount,
 * so StrictMode's double effect is harmless.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
    return listenForCtaPlacement();
  }, []);
  return null;
}
