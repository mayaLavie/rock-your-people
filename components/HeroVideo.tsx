"use client";

import { useEffect, useRef } from "react";

type HeroVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

/** Small no-audio variants (<=110KB) for phones, keyed by the desktop source. */
const MOBILE_VARIANTS: Record<string, string> = {
  "/images/video%20land%20page.mp4": "/images/video-land-page-mobile.mp4",
};

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Data Saver or a 2G connection: keep the poster only, never attach the video. */
function shouldSkipVideo(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return false;
  return connection.saveData === true || ["slow-2g", "2g"].includes(connection.effectiveType ?? "");
}

/**
 * Background hero video that stays out of the LCP path: the poster paints at once,
 * and the MP4 is only attached after the window `load` event plus an idle callback.
 * Autoplay stays muted, looping and inline.
 */
export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let cancelled = false;

    const attach = () => {
      if (cancelled || video.getAttribute("src") || shouldSkipVideo()) return;
      const phone = window.matchMedia("(max-width: 767px)").matches;
      video.src = (phone && MOBILE_VARIANTS[src]) || src;
      void video.play().catch(() => {});
    };
    const afterLoad = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(attach, { timeout: 2500 });
      } else {
        window.setTimeout(attach, 300);
      }
    };

    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", afterLoad);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
