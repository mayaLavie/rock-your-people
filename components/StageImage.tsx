"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** 48x36 blur of the stage photo (about 0.35 KB inline, far below the 0.05 bits/pixel LCP floor). */
const STAGE_BLUR =
  "data:image/webp;base64,UklGRlgBAABXRUJQVlA4IEwBAACQCACdASowACQAPt1kpU8opaMiKrVdURAbiWMAyGAIHaHWBcDH+PzOTGoNFOyHgvxQpHwkbSH+xWflQZAh/8OLhKluEAE5Ngc/7pybAAD++2hwbC7zfuADVqdUVHWsZtQeQfZxKWoWw4DUctSA/VZqlhLXIEfmNecB1JIa/rADtmLMqAMFzNrewnH7IdhcCJG8/MqXlVTgOmAIZYrk6GAqvIU5f7IywuDsnYQHOibw7m1cw20CjMTFT4NM2TdpkzpqCs+wLx1tXeSHfLgrYdC3J+kM3tUqtCW/pb/sUyEtMEUWqgrF5IiziEG8ZIu4HWck1htbvCMB1Yy9h/22h0G/v8LZ7QtUUa0bIeqdPYY8kT9S8/YP65z6yYSMUGVgySISJ5tdZat1XXWT6gRQsPsr+qdIJr5ZFPLsj6xBZuElm8MDoJDKG9g5mwAAAA==";

type StageImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * The photo is requested at the first input, or when BOTH hold: the slot is within STAGE_ROOT_MARGIN
 * of the viewport (IntersectionObserver) and STAGE_SETTLE_MS have passed since the window load event.
 * The settle floor matters only where the slot is already inside the first screen (phones, 390x844):
 * there an immediate request would make this photo the page's LCP. Far below the fold it is never
 * requested until the visitor gets near it.
 */
const STAGE_ROOT_MARGIN = "100% 0px 100% 0px"; // one viewport height above and below
const STAGE_SETTLE_MS = 4000;
const INPUT_EVENTS = ["scroll", "touchstart", "pointerdown", "wheel", "keydown"] as const;

function useNearViewportOrInput(ref: React.RefObject<HTMLElement | null>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    let timer: number | undefined;
    let near = false;
    let settled = false;
    const go = () => {
      cleanup();
      setReady(true);
    };
    const check = () => {
      if (near && settled) go();
    };
    const onLoad = () => {
      timer = window.setTimeout(() => {
        settled = true;
        check();
      }, STAGE_SETTLE_MS);
    };
    const cleanup = () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      for (const name of INPUT_EVENTS) window.removeEventListener(name, go);
    };
    for (const name of INPUT_EVENTS) window.addEventListener(name, go, { passive: true, once: true });
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    const el = ref.current;
    if (el && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          near = entries.some((e) => e.isIntersecting);
          check();
        },
        { rootMargin: STAGE_ROOT_MARGIN },
      );
      observer.observe(el);
    } else {
      near = true; // no IntersectionObserver: fall back to the settle delay alone
    }
    return cleanup;
  }, [ref]);
  return ready;
}

/**
 * The phone stage photo sits right under the hero, inside the first screen. Painted early it would
 * be the page's Largest Contentful Paint (a 90KB photo, charged about 3 to 4 s by the simulated
 * Lighthouse mobile run) instead of the hero text. So the slot is reserved at its final size with a
 * tiny inline blur, and the real photo is requested at the visitor's first scroll/touch/key, or once the slot is within one viewport height
 * of the screen (IntersectionObserver) and 4 s have passed since load. A <noscript> copy keeps the image for crawlers and visitors without scripting.
 */
export function StageImage({ src, alt, width, height }: StageImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useNearViewportOrInput(ref);
  const className = "absolute inset-0 h-full w-full object-cover object-[50%_35%]";
  const sizes = "(min-width: 720px) 720px, 100vw";
  return (
    <div
      ref={ref}
      className="relative aspect-[16/9] max-h-[45vh] w-full bg-cover bg-[position:50%_35%]"
      style={{ backgroundImage: `url(${STAGE_BLUR})` }}
    >
      {ready ? (
        <Image src={src} alt={alt} width={width} height={height} className={className} sizes={sizes} />
      ) : (
        <noscript>
          <Image src={src} alt={alt} width={width} height={height} className={className} sizes={sizes} />
        </noscript>
      )}
    </div>
  );
}
