export type CookieConsent = "accepted" | "declined";

const STORAGE_KEY = "ryp-cookie-consent";
const CHANGE_EVENT = "ryp-cookie-consent-change";

export function getCookieConsent(): CookieConsent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent | null) {
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked; the banner simply shows again on the next visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeCookieConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
