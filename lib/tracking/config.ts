/*
 * Central tracking configuration. Every NEXT_PUBLIC_* value must be referenced
 * literally (process.env.NAME) so Next.js can inline it into the client bundle.
 */

export const META_PIXEL_ID: string = (
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""
).trim();

export type LeadMode = "whatsapp" | "form";

const BUILD_LEAD_MODE: LeadMode =
  (process.env.NEXT_PUBLIC_LEAD_MODE ?? "").trim().toLowerCase() === "form"
    ? "form"
    : "whatsapp";

/** True only in the test build (set by playwright.config.ts). Dead code in production. */
export const E2E_MODE_OVERRIDE_ENABLED = process.env.NEXT_PUBLIC_E2E === "1";
export const E2E_LEAD_MODE_STORAGE_KEY = "ryp-e2e-lead-mode";

export function getBuildLeadMode(): LeadMode {
  return BUILD_LEAD_MODE;
}

/** Client only. The test build may override the mode per browser context. */
export function resolveLeadMode(): LeadMode {
  if (E2E_MODE_OVERRIDE_ENABLED && typeof window !== "undefined") {
    try {
      const v = window.localStorage.getItem(E2E_LEAD_MODE_STORAGE_KEY);
      if (v === "form" || v === "whatsapp") return v;
    } catch {
      // ignore
    }
  }
  return BUILD_LEAD_MODE;
}

export const CAPI_ROUTE = "/api/meta/event";
export const LEAD_ROUTE = "/api/lead";

/** Events the server-side route accepts. */
export const ALLOWED_EVENTS = [
  "PageView",
  "ViewContent",
  "Contact",
  "Lead",
  "CompleteRegistration",
] as const;
export type MetaEventName = (typeof ALLOWED_EVENTS)[number];

/** Optional estimated value of a lead (ILS). Unset = no value/currency is sent. */
const rawLeadValue = Number((process.env.NEXT_PUBLIC_LEAD_VALUE ?? "").trim());
export const LEAD_VALUE: number | undefined =
  Number.isFinite(rawLeadValue) && rawLeadValue > 0 ? rawLeadValue : undefined;
export const LEAD_CURRENCY = "ILS";

/** Optional form field: type of event. Sent to the lead webhook only, never to Meta. */
export const EVENT_TYPES = [
  "כנס/אירוע חברה",
  "יום גיבוש",
  "מסיבה/הפי אוור",
  "אחר",
] as const;

/** sessionStorage key: last clicked #contact CTA placement (first-party, local). */
export const CTA_PLACEMENT_KEY = "ryp-cta-placement";
