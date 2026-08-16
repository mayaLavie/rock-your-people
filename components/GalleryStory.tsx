"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_STORY_ITEMS } from "@/lib/constants";

const IMAGE_DURATION_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;
const DEFAULT_VOLUME = 0.8;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function GalleryStory() {
  const items = GALLERY_STORY_ITEMS;
  const itemCount = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);

  const activeItem = items[activeIndex]!;
  const nextIndex = wrapIndex(activeIndex + 1, itemCount);

  const next = useCallback(() => {
    setActiveIndex((current) => wrapIndex(current + 1, itemCount));
  }, [itemCount]);

  const prev = useCallback(() => {
    setActiveIndex((current) => wrapIndex(current - 1, itemCount));
  }, [itemCount]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncAutoAdvance = () => setAutoAdvance(!mediaQuery.matches);

    syncAutoAdvance();
    mediaQuery.addEventListener("change", syncAutoAdvance);
    return () => mediaQuery.removeEventListener("change", syncAutoAdvance);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.4 },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isInView) {
      video.pause();
      return;
    }

    video.currentTime = 0;
    video.muted = isMutedRef.current;
    video.volume = volumeRef.current;

    // Browsers reject unmuted autoplay until the page has a user gesture
    void video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      void video.play().catch(() => undefined);
    });
  }, [activeIndex, isInView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.volume = volume;
  }, [activeIndex, isMuted, volume]);

  useEffect(() => {
    const bar = progressRef.current;
    if (bar) {
      bar.style.transform = "scaleX(0)";
    }

    if (!autoAdvance || !isInView) return;

    let animationFrame = 0;
    let startedAt: number | null = null;

    const tick = (now: number) => {
      startedAt ??= now;

      let fraction: number;
      if (activeItem.type === "video") {
        const video = videoRef.current;
        fraction =
          video && video.duration > 0 ? video.currentTime / video.duration : 0;
      } else {
        fraction = (now - startedAt) / IMAGE_DURATION_MS;
      }

      if (bar) {
        bar.style.transform = `scaleX(${Math.min(fraction, 1)})`;
      }

      if (activeItem.type === "image" && fraction >= 1) {
        next();
        return;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeIndex, activeItem.type, autoAdvance, isInView, next]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!frameRef.current?.contains(document.activeElement)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  return (
    <div
      ref={frameRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Rock Your People gallery"
      tabIndex={0}
      className="relative mx-auto aspect-[9/16] max-h-[86dvh] w-full overflow-hidden bg-black/40 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:max-h-[78dvh] sm:max-w-[430px] sm:border-[3px] sm:border-cream"
      onTouchStart={(event) => {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartXRef.current;
        touchStartXRef.current = null;
        if (startX === null) return;

        const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

        if (deltaX < 0) {
          next();
        } else {
          prev();
        }
      }}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        if (!isActive && index !== nextIndex) return null;

        return (
          <div
            key={item.src}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.type === "video" ? (
              isActive ? (
                <video
                  ref={videoRef}
                  className={`h-full w-full ${
                    item.fit === "contain" ? "object-contain" : "object-cover"
                  }`}
                  playsInline
                  preload="metadata"
                  poster={item.poster ? encodeURI(item.poster) : undefined}
                  onEnded={next}
                  aria-label={item.alt}
                >
                  <source src={encodeURI(item.src)} type="video/mp4" />
                </video>
              ) : null
            ) : item.fit === "contain" ? (
              <>
                <Image
                  src={encodeURI(item.src)}
                  alt=""
                  aria-hidden
                  fill
                  sizes="64px"
                  className="scale-110 object-cover blur-2xl brightness-75"
                />
                <Image
                  src={encodeURI(item.src)}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 430px"
                  className="object-contain object-center"
                  priority={index === 0}
                />
              </>
            ) : (
              <Image
                src={encodeURI(item.src)}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, 430px"
                className="object-cover object-center"
                priority={index === 0}
              />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-1 p-2">
        {items.map((item, index) => (
          <span
            key={item.src}
            className="h-[3px] flex-1 overflow-hidden bg-cream/30"
          >
            <span
              ref={index === activeIndex ? progressRef : undefined}
              className="block h-full w-full origin-left bg-cream"
              style={{
                transform:
                  index < activeIndex || (index === activeIndex && !autoAdvance)
                    ? "scaleX(1)"
                    : "scaleX(0)",
              }}
            />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="הקודם"
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer border-0 bg-transparent"
      />
      <button
        type="button"
        onClick={next}
        aria-label="הבא"
        className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer border-0 bg-transparent"
      />

      <StoryArrow direction="prev" onClick={prev} />
      <StoryArrow direction="next" onClick={next} />

      {activeItem.type === "video" ? (
        <SoundControls
          isMuted={isMuted}
          volume={volume}
          onToggleMute={() => setIsMuted((current) => !current)}
          onVolumeChange={(value) => {
            setVolume(value);
            setIsMuted(value === 0);
          }}
        />
      ) : null}

      <p className="sr-only" aria-live="polite">
        {`${activeIndex + 1} / ${itemCount}`}
      </p>
    </div>
  );
}

function StoryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden
      tabIndex={-1}
      className={`absolute top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent text-3xl leading-none text-cream/75 transition-[opacity,transform] duration-200 hover:scale-110 hover:text-cream lg:flex ${
        direction === "prev" ? "left-1" : "right-1"
      }`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

type SoundControlsProps = {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
};

function SoundControls({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
}: SoundControlsProps) {
  return (
    <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-black/45 px-2.5 py-1.5 backdrop-blur-sm sm:bottom-4 sm:left-4">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? "הפעלת קול" : "השתקה"}
        aria-pressed={isMuted}
        className="flex h-6 w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-cream transition hover:text-brand-yellow"
      >
        <SpeakerIcon isMuted={isMuted} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={isMuted ? 0 : volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="עוצמת קול"
        className="h-1 w-16 cursor-pointer accent-[#FBEEE3] sm:w-20"
      />
    </div>
  );
}

function SpeakerIcon({ isMuted }: { isMuted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      {isMuted ? (
        <>
          <path d="m17 9 4 6" />
          <path d="m21 9-4 6" />
        </>
      ) : (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}
