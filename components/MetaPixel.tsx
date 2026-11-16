"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureConsentCookie } from "@/lib/tracking/consent-client";
import { listenForWhatsAppClicks } from "@/lib/tracking/clicks";
import { META_PIXEL_ID } from "@/lib/tracking/config";
import { loadPixel } from "@/lib/tracking/pixel";
import { getLastPageViewPath, setLastPageViewPath } from "@/lib/tracking/revoke-state";
import { track } from "@/lib/tracking/track";
import {
  observeProducts,
  resetViewContent,
} from "@/lib/tracking/viewcontent";

/**
 * Rendered only after the visitor accepts cookies. Loads the pixel, fires the
 * PageView, ViewContent for product sections and Contact for WhatsApp links.
 * Never sends form contents. Renders nothing when no pixel id is configured.
 */
export function MetaPixel() {
  const pathname = usePathname();
  // A returning visitor's signed server cookie is re-issued first, so the first PageView is accepted.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureConsentCookie().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !META_PIXEL_ID || !loadPixel()) return;
    return listenForWhatsAppClicks();
  }, [ready]);

  useEffect(() => {
    if (!ready || !META_PIXEL_ID || !loadPixel()) return;
    // One PageView per page view: the first one after consent, then one per
    // client-side navigation (e.g. /lp/... -> /).
    // Module state (revoke-state) survives React StrictMode's double effects.
    const last = getLastPageViewPath();
    if (last !== pathname) {
      const isNavigation = last !== null;
      setLastPageViewPath(pathname);
      if (isNavigation) resetViewContent();
      track("PageView");
    }
    return observeProducts();
  }, [pathname, ready]);

  return null;
}
