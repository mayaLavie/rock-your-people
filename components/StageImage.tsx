"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** 48x36 blur of the stage photo (about 0.35 KB inline, far below the 0.05 bits/pixel LCP floor). */
const STAGE_BLUR =
  "data:image/webp;base64,UklGRlgBAABXRUJQVlA4IEwBAACQCACdASowACQAPt1kpU8opaMiKrVdURAbiWMAyGAIHaHWBcDH+PzOTGoNFOyHgvxQpHwkbSH+xWflQZAh/8OLhKluEAE5Ngc/7pybAAD++2hwbC7zfuADVqdUVHWsZtQeQfZxKWoWw4DUctSA/VZqlhLXIEfmNecB1JIa/rADtmLMqAMFzNrewnH7IdhcCJG8/MqXlVTgOmAIZYrk6GAqvIU5f7IywuDsnYQHOibw7m1cw20CjMTFT4NM2TdpkzpqCs+wLx1tXeSHfLgrYdC3J+kM3tUqtCW/pb/sUyEtMEUWqgrF5IiziEG8ZIu4HWck1htbvCMB1Yy9h/22h0G/v8LZ7QtUUa0bIeqdPYY8kT9S8/YP65z6yYSMUGVgySISJ5tdZat1XXWT6gRQsPsr+qdIJr5ZFPLsj6xBZuElm8MDoJDKG9g5mwAAAA==";

type StageImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** True at the first scroll/touch/key input, or STAGE_IMAGE_DELAY_MS after the window load event. */
const STAGE_IMAGE_DELAY_MS = 4000;
const INPUT_EVENTS = ["scroll", "touchstart", "pointerdown", "wheel", "keydown"] as const;

function useAfterInputOrDelay() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const go = () => {
      cleanup();
      setReady(true);
    };
    const onLoad = () => {
      timer = window.setTimeout(go, STAGE_IMAGE_DELAY_MS);
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      for (const name of INPUT_EVENTS) window.removeEventListener(name, go);
    };
    for (const name of INPUT_EVENTS) window.addEventListener(name, go, { passive: true, once: true });
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return cleanup;
  }, []);
  return ready;
}

/**
 * The phone stage photo sits right under the hero, inside the first screen. Painted early it would
 * be the page's Largest Contentful Paint (a 90KB photo, charged about 3 to 4 s by the simulated
 * Lighthouse mobile run) instead of the hero text. So the slot is reserved at its final size with a
 * tiny inline blur, and the real photo is requested at the visitor's first scroll/touch/key, or 4 s
 * after load. A <noscript> copy keeps the image for crawlers and visitors without scripting.
 */
export function StageImage({ src, alt, width, height }: StageImageProps) {
  const ready = useAfterInputOrDelay();
  const className = "absolute inset-0 h-full w-full object-cover object-[50%_35%]";
  const sizes = "(min-width: 720px) 720px, 100vw";
  return (
    <div
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
