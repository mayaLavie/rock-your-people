"use client";

import { CTA_PLACEMENT_KEY } from "./config";

/*
 * Remembers which CTA led the visitor to the contact section, so the later Lead / Contact can carry
 * it as `cta_placement`. In-page anchor clicks never fire a Meta event of their own. Everything stays
 * in sessionStorage (this tab only) and nothing is sent before consent.
 *
 * Contract for CTA authors: put data-placement="hero | hero-secondary | carousel-end | reviews-end |
 * faq-end | lp-hero | lp-sticky" on the link (or an ancestor). Without it the placement is derived from
 * the closest section id / landing page markup.
 */

const CONTACT_LINK = 'a[href="#contact"], a[href$="#contact"]';

function derive(link: Element): string {
  const explicit = link.closest<HTMLElement>("[data-placement]")?.dataset.placement;
  if (explicit) return explicit.slice(0, 40);
  if (link.closest("header")) return "header";
  if (link.closest('[data-testid="landing-sticky-bar"]')) return "lp-sticky";
  const landing = Boolean(link.closest("main[data-page-type=landing]"));
  if (link.closest('[aria-labelledby="hero-heading"]')) return landing ? "lp-hero" : "hero";
  const sectionId = link.closest("section[id]")?.id;
  if (sectionId) return `section-${sectionId}`.slice(0, 40);
  return landing ? "lp-section" : "section";
}

function onClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest(CONTACT_LINK);
  if (!link) return;
  try {
    window.sessionStorage.setItem(CTA_PLACEMENT_KEY, derive(link));
  } catch {
    // Storage can be blocked.
  }
}

/** One document-level listener; runs regardless of consent (local only). */
export function listenForCtaPlacement(): () => void {
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

export function readCtaPlacement(): string | undefined {
  try {
    return window.sessionStorage.getItem(CTA_PLACEMENT_KEY) || undefined;
  } catch {
    return undefined;
  }
}
