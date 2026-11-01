"use client";

import { setCookieConsent } from "@/lib/cookie-consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => setCookieConsent(null)}
      className={className}
    >
      Cookie settings
    </button>
  );
}
