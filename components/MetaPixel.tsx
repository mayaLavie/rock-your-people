"use client";

import Script from "next/script";
import { useEffect } from "react";

const META_PIXEL_ID = "2338134653708173";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_LINK_SELECTOR =
  'a[href*="wa.me/"], a[href*="api.whatsapp.com/"]';

/** Rendered only after the visitor accepts cookies. Never sends form contents. */
export function MetaPixel() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const link = (event.target as Element).closest?.(WHATSAPP_LINK_SELECTOR);
      if (!link) return;
      const eventName = link.closest("#contact") ? "Lead" : "Contact";
      window.fbq?.("track", eventName);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('set','autoConfig',false,'${META_PIXEL_ID}');
fbq('init','${META_PIXEL_ID}');
fbq('track','PageView');`}
    </Script>
  );
}
