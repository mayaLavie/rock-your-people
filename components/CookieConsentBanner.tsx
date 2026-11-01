"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MetaPixel } from "@/components/MetaPixel";
import {
  getCookieConsent,
  setCookieConsent,
  subscribeCookieConsent,
} from "@/lib/cookie-consent";

function declineCookies() {
  const pixelWasLoaded = Boolean(window.fbq);
  setCookieConsent("declined");
  if (!pixelWasLoaded) return;

  // The pixel can't be unloaded, so clear its cookies and start a clean page.
  const domain = window.location.hostname.replace(/^www\./, "");
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  }
  window.location.reload();
}

export function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsent,
    () => undefined,
  );

  if (consent === undefined) return null;
  if (consent === "accepted") return <MetaPixel />;
  if (consent === "declined") return null;

  return (
    <div
      role="region"
      aria-label="הודעה על עוגיות"
      lang="he"
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-cream bg-black px-4 py-2 sm:px-6 sm:py-4"
    >
      <div className="mx-auto max-w-[1400px] [text-align-last:justify] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:[text-align-last:auto]">
        <p className="inline font-hebrew text-xs leading-relaxed text-cream/90 sm:block sm:text-sm">
          אנחנו רוצים להשתמש בעוגיות ובפיקסל של Meta לפרסום ולמדידה.{" "}
          <span className="inline-block whitespace-nowrap [text-align-last:auto]">
            פרטים ב
            <Link href="/privacy" className="underline underline-offset-2">
              מדיניות הפרטיות
            </Link>
            .
          </span>
        </p>{" "}
        <div className="inline-flex shrink-0 gap-2 whitespace-nowrap align-middle sm:flex sm:gap-3">
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="border-2 border-cream bg-cream px-2 py-0.5 font-hebrew text-[11px] font-semibold sm:px-5 sm:py-2 sm:text-sm text-black transition hover:bg-cream/80"
          >
            מאשר/ת
          </button>
          <button
            type="button"
            onClick={declineCookies}
            className="border-2 border-cream px-2 py-0.5 font-hebrew text-[11px] font-semibold sm:px-5 sm:py-2 sm:text-sm text-cream transition hover:bg-cream/15"
          >
            לא מאשר/ת
          </button>
        </div>
      </div>
    </div>
  );
}
