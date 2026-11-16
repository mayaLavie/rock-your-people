"use client";

import { setCookieConsent } from "@/lib/cookie-consent";

export function CookieSettingsButton({
  className,
  children = "הגדרות עוגיות",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => setCookieConsent(null)}
      className={className}
    >
      {children}
    </button>
  );
}
