"use client";

import { detectProduct } from "./products";
import { track } from "./track";

export const WHATSAPP_LINK_SELECTOR =
  'a[href*="wa.me/"], a[href*="api.whatsapp.com/"]';

/** Marks the contact form's own submit link: it is the Lead, never a Contact. */
export const LEAD_SUBMIT_ATTR = "data-lead-submit";

function placementFor(link: Element): string {
  const explicit = link.closest<HTMLElement>("[data-placement]")?.dataset
    .placement;
  if (explicit) return explicit;
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  if (link.closest("#contact")) return "contact-form";
  if (link.closest('[aria-labelledby="hero-heading"]')) return "hero";
  return "section";
}

function onClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest(WHATSAPP_LINK_SELECTOR);
  if (!link || link.hasAttribute(LEAD_SUBMIT_ATTR)) return;
  track("Contact", {
    content_name: detectProduct(link),
    placement: placementFor(link),
  });
}

/** One document-level listener for every WhatsApp link on every page. */
export function listenForWhatsAppClicks(): () => void {
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
