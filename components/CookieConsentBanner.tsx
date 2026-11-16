"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { MetaPixel } from "@/components/MetaPixel";
import {
  getCookieConsent,
  setCookieConsent,
  subscribeCookieConsent,
} from "@/lib/cookie-consent";
import { captureAttribution } from "@/lib/tracking/attribution";
import { acceptConsent, stopTracking } from "@/lib/tracking/consent-client";
import { listenForCtaPlacement } from "@/lib/tracking/placement";

const buttonClass =
  "min-h-[44px] flex-1 rounded-[5px] border-2 border-cream bg-cream px-3 font-hebrew text-sm font-semibold text-black transition hover:bg-cream/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:w-32 sm:flex-none";

export function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsent,
    () => undefined,
  );
  const previous = useRef<typeof consent>(undefined);

  // First-party only: remembers utm_* / fbclid and the last CTA placement in sessionStorage,
  // sends nothing.
  useEffect(() => {
    captureAttribution();
    return listenForCtaPlacement();
  }, []);

  // Consent withdrawn (declined, or "cookie settings" reopened the banner): stop in place, no reload.
  useEffect(() => {
    const before = previous.current;
    const withdrawn = before === "accepted" && consent !== "accepted";
    const declinedNow = before === null && consent === "declined";
    if (withdrawn || declinedNow) stopTracking();
    previous.current = consent;
  }, [consent]);

  // CSS hook: other fixed bottom UI (landing sticky bar) steps aside while the banner is open.
  const open = consent === null;
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.consentBanner = "open";
    return () => {
      delete document.documentElement.dataset.consentBanner;
    };
  }, [open]);

  if (consent === undefined) return null;
  if (consent === "accepted") return <MetaPixel />;
  if (consent === "declined") return null;

  return (
    <div
      role="region"
      aria-label="הודעה על עוגיות"
      lang="he"
      dir="rtl"
      data-testid="cookie-banner"
      className="fixed inset-x-0 bottom-0 z-[200] border-t-2 border-cream bg-black px-3 pt-1.5 sm:px-6 sm:pt-3"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="font-hebrew text-xs leading-[1.25] text-cream sm:text-sm">
          עוגיות ופיקסל של Meta לשתי מטרות, באישור אחד: מדידה, והצגת מודעות
          מותאמות. המידע עשוי לעבור אל מחוץ לישראל.{" "}
          <Link
            href="/privacy"
            className="whitespace-nowrap font-semibold underline underline-offset-2"
          >
            פרטים
          </Link>
        </p>
        <div className="flex shrink-0 gap-2 sm:gap-3">
          <button type="button" onClick={() => void acceptConsent()} className={buttonClass}>
            אישור
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("declined")}
            className={buttonClass}
          >
            דחייה
          </button>
        </div>
      </div>
    </div>
  );
}
