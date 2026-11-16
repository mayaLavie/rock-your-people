"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * Non-critical client islands (consent banner + pixel loader, landing sticky bar) are kept out of
 * the first-paint JS: their code is a separate chunk that is only requested after the window
 * `load` event plus an idle callback (or the first user input, whichever comes first).
 * Consent gating is unchanged: the banner and MetaPixel are the same components, just mounted later;
 * nothing is tracked before the visitor accepts.
 */

const CookieConsentBanner = dynamic(
  () => import("@/components/CookieConsentBanner").then((m) => m.CookieConsentBanner),
  { ssr: false },
);
const LandingStickyBar = dynamic(
  () => import("@/components/landing/LandingStickyBar").then((m) => m.LandingStickyBar),
  { ssr: false },
);

/** true after load + idle (max `maxWaitMs` after load), or at the first input. */
function useAfterIdle(maxWaitMs: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    };
    const afterLoad = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(go, { timeout: maxWaitMs });
      } else {
        window.setTimeout(go, Math.min(maxWaitMs, 300));
      }
    };
    const inputs = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const cleanup = () => {
      window.removeEventListener("load", afterLoad);
      inputs.forEach((e) => window.removeEventListener(e, go));
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    inputs.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return cleanup;
  }, [maxWaitMs]);
  return ready;
}

export function DeferredConsent() {
  const ready = useAfterIdle(700);
  return ready ? <CookieConsentBanner /> : null;
}

export function DeferredStickyBar(props: {
  label: string;
  whatsappUrl: string;
  heroCtaId: string;
}) {
  const ready = useAfterIdle(1500);
  return ready ? <LandingStickyBar {...props} /> : null;
}
