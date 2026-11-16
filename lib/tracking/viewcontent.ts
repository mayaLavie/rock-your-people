"use client";

import { isProductSlug } from "./products";
import { track } from "./track";

const seen = new Set<string>();

function fire(slug: string) {
  if (seen.has(slug) || !isProductSlug(slug)) return;
  seen.add(slug);
  track("ViewContent", {
    content_name: slug,
    content_type: "product",
    content_category: "experience",
  });
}

/** New page view (client navigation): ViewContent may fire again per slug. */
export function resetViewContent() {
  seen.clear();
}

/**
 * Fires ViewContent once per product slug per page view: immediately for the
 * page root main[data-product], and when a [data-product] element is at least
 * half visible (or fills half the viewport, for sections taller than 2 screens).
 */
export function observeProducts(): () => void {
  const root = document.querySelector<HTMLElement>("main[data-product]");
  if (root?.dataset.product) fire(root.dataset.product);

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-product]"),
  ).filter((el) => el !== root);
  if (!targets.length || typeof IntersectionObserver === "undefined") {
    return () => {};
  }

  const thresholds = Array.from({ length: 51 }, (_, i) => i / 50);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const slug = (e.target as HTMLElement).dataset.product;
        if (!slug || !e.isIntersecting) continue;
        const viewport = e.rootBounds?.height ?? window.innerHeight;
        if (
          e.intersectionRatio >= 0.5 ||
          e.intersectionRect.height >= viewport * 0.5
        ) {
          fire(slug);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: thresholds },
  );
  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
