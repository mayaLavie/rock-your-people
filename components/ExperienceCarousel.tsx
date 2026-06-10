"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { EXPERIENCES_CARD_HEADLINE_HE } from "@/lib/constants";

const STAGE_IMAGE_SRC = "/images/gemini band pic.png";
const TRIO_IMAGE_SRC = "/images/Screenshot trio 360.png";
const WORKSHOP_IMAGE_SRC = "/images/workshop4.png";

const DEFAULT_ACTIVE_INDEX = 1;
const SWIPE_THRESHOLD_PX = 50;
const TEXT_FADE_OUT_MS = 150;
const TEXT_FADE_IN_DELAY_MS = 200;
const TEXT_TRANSITION_MS = TEXT_FADE_OUT_MS + TEXT_FADE_IN_DELAY_MS;

const CARD_BORDER =
  "border-2 border-cream transition-[border-color,box-shadow] duration-300 sm:border-[3px]";
const CARD_IMAGE_CLASS =
  "object-cover transition duration-500 ease-out motion-reduce:transition-none";
const STAGE_TITLE =
  "font-stage-title uppercase leading-none tracking-wide text-brand-yellow";

type ExperienceTheme = "trio" | "stage" | "workshop";

type ExperienceCard = {
  id: string;
  title: string;
  headline: string;
  topText?: string;
  caption: string;
  image: string;
  href: string;
  theme: ExperienceTheme;
};

const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    id: "trio-360",
    title: "Trio 360",
    headline: EXPERIENCES_CARD_HEADLINE_HE["trio-360"],
    topText: "הופעות חיות",
    caption: "טריו חי, קרוב ומשחרר שמתאים גם לחללים קטנים ואינטימיים.",
    image: TRIO_IMAGE_SRC,
    href: "#trio-360",
    theme: "trio",
  },
  {
    id: "your-people-on-stage",
    title: "Your People On Stage",
    headline: "",
    topText: "הופעות אינטרקטיביות  - האנשים שלכם על הבמה",
    caption: "מופע גדול ואינטראקטיבי שבו הקהל הופך לחלק מהלהקה.",
    image: STAGE_IMAGE_SRC,
    href: "#your-people-on-stage",
    theme: "stage",
  },
  {
    id: "musical-leadership-workshop",
    title: "Team Harmony",
    headline: EXPERIENCES_CARD_HEADLINE_HE["musical-leadership-workshop"],
    topText: "סדנאות",
    caption: "סדנה מוזיקלית שמחברת צוותים דרך קצב, הקשבה ושיתוף פעולה.",
    image: WORKSHOP_IMAGE_SRC,
    href: "#leadership-workshop",
    theme: "workshop",
  },
];

function scrollToExperienceSection(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

function getCardTransform(offset: number) {
  if (Math.abs(offset) > 1) {
    return {
      opacity: 0,
      transform: "translate(-50%, -50%) scale(0.7)",
      zIndex: 0,
      pointerEvents: "none" as const,
    };
  }

  const translateX = offset * 30;
  const scale = offset === 0 ? 1 : 0.82;
  const opacity = offset === 0 ? 1 : 0.55;
  const zIndex = offset === 0 ? 30 : 20;

  return {
    opacity,
    transform: `translate(-50%, -50%) translateX(${translateX}vw) scale(${scale})`,
    zIndex,
    pointerEvents: "auto" as const,
  };
}

const TEXT_TRANSITION_VISIBLE =
  "opacity-100 translate-y-0 blur-0";
const TEXT_TRANSITION_HIDDEN =
  "opacity-0 translate-y-3 blur-sm";
const TEXT_TRANSITION_BASE =
  "transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:blur-none";

export function ExperienceCarousel() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX);
  const [displayedIndex, setDisplayedIndex] = useState(DEFAULT_ACTIVE_INDEX);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const displayedIndexRef = useRef(displayedIndex);

  displayedIndexRef.current = displayedIndex;

  const displayedCard = EXPERIENCE_CARDS[displayedIndex]!;

  const goTo = useCallback((index: number) => {
    setActiveIndex(
      Math.min(Math.max(index, 0), EXPERIENCE_CARDS.length - 1),
    );
  }, []);

  const prev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const next = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const handleCardActivate = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        scrollToExperienceSection(EXPERIENCE_CARDS[index]!.href);
        return;
      }
      goTo(index);
    },
    [activeIndex, goTo],
  );

  useEffect(() => {
    if (activeIndex === displayedIndexRef.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setDisplayedIndex(activeIndex);
      setIsTextTransitioning(false);
      return;
    }

    setIsTextTransitioning(true);

    const swapTimeout = window.setTimeout(() => {
      setDisplayedIndex(activeIndex);
    }, TEXT_FADE_OUT_MS);

    const endTimeout = window.setTimeout(() => {
      setIsTextTransitioning(false);
    }, TEXT_TRANSITION_MS);

    return () => {
      window.clearTimeout(swapTimeout);
      window.clearTimeout(endTimeout);
    };
  }, [activeIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!regionRef.current?.contains(document.activeElement)) return;

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
      ref={regionRef}
      className="w-full outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Rock Your People experiences"
      tabIndex={0}
    >
      <div
        className="mb-[10px] flex min-h-[2.75rem] items-end justify-center sm:min-h-[2.5rem]"
        aria-live="polite"
      >
        {displayedCard.topText ? (
          <p
            key={displayedCard.id}
            lang="he"
            dir="rtl"
            className={`mx-auto max-w-md px-2 text-center font-hebrew text-pretty text-[13px] font-medium leading-snug text-cream sm:text-[14px] ${TEXT_TRANSITION_BASE} ${
              isTextTransitioning
                ? `${TEXT_TRANSITION_HIDDEN} motion-reduce:opacity-100 motion-reduce:translate-y-0`
                : TEXT_TRANSITION_VISIBLE
            }`}
          >
            {displayedCard.topText}
          </p>
        ) : null}
      </div>

      <div
        className="relative mx-auto h-[min(83vw,19.33rem)] w-full max-w-[32rem] overflow-hidden touch-pan-y md:h-[28rem] md:max-w-[44rem]"
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartXRef.current;
          const endX = event.changedTouches[0]?.clientX;
          touchStartXRef.current = null;
          if (startX == null || endX == null) return;

          const distance = endX - startX;
          if (distance > SWIPE_THRESHOLD_PX) prev();
          if (distance < -SWIPE_THRESHOLD_PX) next();
        }}
      >
        {EXPERIENCE_CARDS.map((card, index) => {
          const offset = index - activeIndex;
          const style = getCardTransform(offset);
          const isActive = index === activeIndex;

          return (
            <button
              key={card.id}
              type="button"
              aria-label={
                isActive
                  ? `${card.title} — גלו עוד על החוויה`
                  : `הציגו את ${card.title}`
              }
              aria-current={isActive ? "true" : undefined}
              onClick={() => handleCardActivate(index)}
              className={`absolute top-1/2 left-1/2 aspect-[3/4] w-[min(62vw,14.5rem)] max-h-[min(82vw,19.33rem)] cursor-pointer overflow-hidden bg-black transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none sm:w-[min(58vw,15.5rem)] md:w-[20rem] md:max-h-none ${
                isActive
                  ? `${CARD_BORDER} shadow-[0_20px_50px_rgba(0,0,0,0.45)] hover:border-[#FBEEE3]`
                  : `${CARD_BORDER} brightness-90`
              }`}
              style={style}
            >
              <ExperienceCardVisual card={card} isActive={isActive} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceCardVisual({
  card,
  isActive,
}: {
  card: ExperienceCard;
  isActive: boolean;
}) {
  if (card.theme === "stage") {
    return (
      <div className="relative h-full w-full">
        <Image
          src={encodeURI(card.image)}
          alt=""
          fill
          sizes="(max-width: 640px) 75vw, 22rem"
          className={`scale-110 object-cover object-[50%_115%] ${CARD_IMAGE_CLASS} ${
            isActive ? "brightness-110" : ""
          }`}
        />
        <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 pt-3 pb-8 sm:px-4 sm:pt-4 sm:pb-10">
          <span className={`${STAGE_TITLE} block text-[33px]`}>
            {card.title}
          </span>
        </div>
      </div>
    );
  }

  if (card.theme === "trio") {
    return (
      <>
        <Image
          src={encodeURI(card.image)}
          alt=""
          fill
          sizes="(max-width: 640px) 75vw, 22rem"
          className={`object-cover object-center ${CARD_IMAGE_CLASS} ${
            isActive ? "brightness-110" : ""
          }`}
        />
        <span className="sr-only">{card.title}</span>
      </>
    );
  }

  return (
    <>
      <Image
        src={encodeURI(card.image)}
        alt=""
        fill
        sizes="(max-width: 640px) 75vw, 22rem"
        className={`object-cover object-center ${CARD_IMAGE_CLASS} ${
          isActive ? "brightness-110" : ""
        }`}
      />
      <span className="sr-only">{card.title}</span>
    </>
  );
}
