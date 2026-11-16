"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { listenForWhatsAppClicks } from "@/lib/tracking/clicks";
import { META_PIXEL_ID } from "@/lib/tracking/config";
import { loadPixel } from "@/lib/tracking/pixel";
import { track } from "@/lib/tracking/track";
import {
  observeProducts,
  resetViewContent,
} from "@/lib/tracking/viewcontent";

/* Module state survives React StrictMode's double effects. */
let lastPageViewPath: string | null = null;

/**
 * Rendered only after the visitor accepts cookies. Loads the pixel, fires the
 * PageView, ViewContent for product sections and Contact for WhatsApp links.
 * Never sends form contents. Renders nothing when no pixel id is configured.
 */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!META_PIXEL_ID || !loadPixel()) return;
    return listenForWhatsAppClicks();
  }, []);

  useEffect(() => {
    if (!META_PIXEL_ID || !loadPixel()) return;
    // One PageView per page view: the first one after consent, then one per
    // client-side navigation (e.g. /lp/... -> /).
    if (lastPageViewPath !== pathname) {
      const isNavigation = lastPageViewPath !== null;
      lastPageViewPath = pathname;
      if (isNavigation) resetViewContent();
      track("PageView");
    }
    return observeProducts();
  }, [pathname]);

  return null;
}
