"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";

type Props = {
  label: string;
  whatsappUrl: string;
  /** id of the hero CTA; the bar appears once it has scrolled out above the viewport */
  heroCtaId: string;
};

/**
 * Mobile-only bottom CTA. Visible after the hero CTA scrolled past, hidden while the
 * contact form or the footer is in view so it never covers them. It is also hidden
 * while the consent bar is open (html[data-consent-banner="open"], set by the consent
 * component), so two fixed bars never stack at the bottom of a phone screen.
 */
export function LandingStickyBar({ label, whatsappUrl, heroCtaId }: Props) {
  const [heroPassed, setHeroPassed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroCtaId);
    const contact = document.getElementById("contact");
    const footer = document.querySelector("footer");
    const blockers = new Set<Element>();

    const heroObserver = new IntersectionObserver(([entry]) => {
      setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    const blockObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) blockers.add(entry.target);
        else blockers.delete(entry.target);
      }
      setBlocked(blockers.size > 0);
    });

    if (hero) heroObserver.observe(hero);
    if (contact) blockObserver.observe(contact);
    if (footer) blockObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      blockObserver.disconnect();
    };
  }, [heroCtaId]);

  const visible = heroPassed && !blocked;

  return (
    <div
      data-testid="landing-sticky-bar"
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-[150] border-t-[3px] border-cream bg-black px-4 pt-3 transition-transform duration-300 motion-reduce:transition-none sm:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      } [html[data-consent-banner=open]_&]:pointer-events-none [html[data-consent-banner=open]_&]:invisible`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      inert={!visible}
    >
      <div className="flex items-center gap-3" lang="he" dir="rtl">
        <a
          href="#contact"
          data-placement="lp-sticky"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[5px] border border-[#FBEEE3] bg-[#FBEEE3] px-4 font-hebrew text-[15px] font-bold text-[#1e1c1c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          {label}
        </a>
        <a
          href={whatsappUrl}
          data-placement="lp-sticky"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="שליחת הודעה בוואטסאפ"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] bg-[#25D366] text-[#0a0a0a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
