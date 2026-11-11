"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { EXPERIENCES_CARD_HEADLINE_HE } from "@/lib/constants";

const STAGE_IMAGE_SRC = "/images/gemini band pic.png";
const TRIO_IMAGE_SRC = "/images/rock-your-dj-party.png";
const WORKSHOP_IMAGE_SRC = "/images/band-in-a-day-collage-title.png";
const OFFICE_IMAGE_SRC = "/images/rock-your-people-in-office.jpeg";

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

const POSTER_TITLE =
  "block whitespace-nowrap text-center font-hebrew leading-none text-brand-yellow";

const HEBREW_TEXT = /[\u0590-\u05FF]/;

type ExperienceTheme = "trio" | "stage" | "workshop" | "office";

type ExperienceCard = {
  id: string;
  title: string;
  headline: string;
  topText?: string;
  posterBottomLine?: string;
  caption: string;
  scrollAriaLabel: string;
  image: string;
  href: string;
  theme: ExperienceTheme;
};

const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    id: "trio-360",
    title: "Rock Your DJ",
    headline: EXPERIENCES_CARD_HEADLINE_HE["trio-360"],
    topText: "מסיבה עם נגנים לייב",
    caption: "טריו חי, קרוב ומשחרר שמתאים גם לחללים קטנים ואינטימיים.",
    scrollAriaLabel: "גלו עוד על Rock Your DJ",
    image: TRIO_IMAGE_SRC,
    href: "#trio-360",
    theme: "trio",
  },
  {
    id: "your-people-on-stage",
    title: "אתם על הבמה",
    headline: "",
    posterBottomLine: "להקה מקצועית, מופע חשמלי !",
    topText: "הופעות אינטרקטיביות - האנשים שלכם הם הכוכבים",
    caption: "מופע גדול ואינטראקטיבי שבו הקהל הופך לחלק מהלהקה.",
    scrollAriaLabel: "גלו עוד על המופע",
    image: STAGE_IMAGE_SRC,
    href: "#your-people-on-stage",
    theme: "stage",
  },
  {
    id: "musical-leadership-workshop",
    title: "Band in a Day",
    headline: EXPERIENCES_CARD_HEADLINE_HE["musical-leadership-workshop"],
    topText: "סדנת גיבוש מוזיקלית",
    caption: "לצאת מהשגרה, להיכנס לקצב ולהפיק יצירה משותפת משלכם.",
    scrollAriaLabel: "גלו עוד על הסדנה",
    image: WORKSHOP_IMAGE_SRC,
    href: "#leadership-workshop",
    theme: "workshop",
  },
  {
    id: "beer-office",
    title: "בירה ונרימה",
    headline: "",
    topText: "הרכב אקוסטי מיוחד - שירים שכולם אוהבים\nואתם שרים איתנו",
    caption: "",
    scrollAriaLabel: "גלו עוד על בירה ונרימה",
    image: OFFICE_IMAGE_SRC,
    href: "#beer-office",
    theme: "office",
  },
];

function scrollToExperienceSection(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getCircularOffset(
  index: number,
  activeIndex: number,
  length: number,
) {
  let offset = index - activeIndex;
  const half = length / 2;

  if (offset > half) {
    offset -= length;
  } else if (offset < -half) {
    offset += length;
  }

  return offset;
}

function getCardTransform(offset: number, layout: "mobile" | "desktop") {
  if (Math.abs(offset) > 1) {
    return {
      opacity: 0,
      transform: "translate(-50%, -50%) scale(0.7)",
      zIndex: 0,
      pointerEvents: "none" as const,
    };
  }

  if (layout === "desktop") {
    const translateX = offset * 108;
    const scale = offset === 0 ? 1 : 0.86;
    const opacity = offset === 0 ? 1 : 0.52;
    const zIndex = offset === 0 ? 30 : 20;

    return {
      opacity,
      transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
      zIndex,
      pointerEvents: "auto" as const,
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

function useDesktopCarouselLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncLayout = () => setIsDesktop(mediaQuery.matches);

    syncLayout();
    mediaQuery.addEventListener("change", syncLayout);
    return () => mediaQuery.removeEventListener("change", syncLayout);
  }, []);

  return isDesktop;
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const label =
    direction === "prev" ? "החוויה הקודמת" : "החוויה הבאה";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent text-2xl leading-none text-[#FBEEE3]/75 transition-[opacity,transform] duration-200 hover:scale-110 hover:text-[#FBEEE3] lg:flex ${
        direction === "prev"
          ? "left-4 lg:-left-3 xl:-left-6"
          : "right-4 lg:-right-3 xl:-right-6"
      }`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

const TEXT_TRANSITION_VISIBLE =
  "opacity-100 translate-y-0 blur-0";
const TEXT_TRANSITION_HIDDEN =
  "opacity-0 translate-y-3 blur-sm";
const TEXT_TRANSITION_BASE =
  "transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:blur-none";

const ACTIVE_CARD_HOVER =
  "group lg:hover:border-[#FBEEE3] lg:hover:shadow-[0_22px_55px_rgba(0,0,0,0.52)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

export function ExperienceCarousel() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX);
  const [displayedIndex, setDisplayedIndex] = useState(DEFAULT_ACTIVE_INDEX);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const displayedIndexRef = useRef(displayedIndex);
  const isDesktopLayout = useDesktopCarouselLayout();
  const carouselLayout = isDesktopLayout ? "desktop" : "mobile";

  displayedIndexRef.current = displayedIndex;

  const displayedCard = EXPERIENCE_CARDS[displayedIndex]!;

  const cardCount = EXPERIENCE_CARDS.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(wrapIndex(index, cardCount));
    },
    [cardCount],
  );

  const prev = useCallback(() => {
    setActiveIndex((current) => wrapIndex(current - 1, cardCount));
  }, [cardCount]);

  const next = useCallback(() => {
    setActiveIndex((current) => wrapIndex(current + 1, cardCount));
  }, [cardCount]);

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
      className="flex w-full flex-col outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Rock Your People experiences"
      tabIndex={0}
    >
      <div
        className="mb-[10px] flex min-h-[2.75rem] items-end justify-center sm:min-h-[2.5rem] lg:order-last lg:mb-0 lg:mt-1 lg:min-h-[2.75rem] lg:items-start"
        aria-live="polite"
      >
        {displayedCard.topText ? (
          <p
            key={displayedCard.id}
            lang="he"
            dir="rtl"
            className={`m-0 mx-auto max-w-md whitespace-pre-line px-2 text-center font-hebrew text-pretty text-[13px] font-medium leading-snug text-cream sm:text-[14px] lg:text-[15px] lg:font-semibold ${TEXT_TRANSITION_BASE} ${
              isTextTransitioning
                ? `${TEXT_TRANSITION_HIDDEN} motion-reduce:opacity-100 motion-reduce:translate-y-0`
                : TEXT_TRANSITION_VISIBLE
            }`}
          >
            {displayedCard.topText}
          </p>
        ) : null}
      </div>

      <div className="relative mx-auto w-full max-w-[32rem] lg:max-w-[26rem] lg:overflow-visible lg:px-11 lg:pt-6 lg:pb-6">
        <CarouselArrow direction="prev" onClick={prev} />
        <CarouselArrow direction="next" onClick={next} />

        <div
          className="experience-carousel-viewport relative mx-auto h-[min(83vw,19.33rem)] w-full overflow-hidden touch-pan-y md:max-lg:h-[28rem] md:max-w-[44rem] lg:h-[calc(13.75rem*4/3)] lg:min-h-0 lg:max-w-full lg:overflow-x-hidden lg:overflow-y-visible lg:p-0"
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
            const offset = getCircularOffset(index, activeIndex, cardCount);
            const style = getCardTransform(offset, carouselLayout);
            const isActive = index === activeIndex;

            return (
              <button
                key={card.id}
                type="button"
                aria-label={
                  isActive ? card.scrollAriaLabel : `הציגו את ${card.title}`
                }
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleCardActivate(index)}
                className={`absolute top-1/2 left-1/2 aspect-[3/4] w-[min(62vw,14.5rem)] max-h-[min(82vw,19.33rem)] cursor-pointer overflow-hidden rounded-[5px] bg-black transition-[transform,opacity,box-shadow,border-color] duration-500 ease-out motion-reduce:transition-none sm:w-[min(58vw,15.5rem)] md:w-[20rem] md:max-h-none lg:w-[13.75rem] lg:max-h-none ${
                  isActive
                    ? `${CARD_BORDER} shadow-[0_20px_50px_rgba(0,0,0,0.45)] ${ACTIVE_CARD_HOVER}`
                    : `${CARD_BORDER} brightness-90`
                }`}
                style={style}
              >
                <ExperienceCardVisual
                  card={card}
                  isActive={isActive}
                  compact={isDesktopLayout}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExperienceCardVisual({
  card,
  isActive,
  compact = false,
}: {
  card: ExperienceCard;
  isActive: boolean;
  compact?: boolean;
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
        <div
          className={`absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 pt-5 pb-8 sm:px-4 sm:pt-6 sm:pb-10 ${
            compact ? "lg:px-2.5 lg:pt-4 lg:pb-6" : ""
          }`}
        >
          <span
            className={
              HEBREW_TEXT.test(card.title)
                ? `${POSTER_TITLE} -mx-3 text-[33px] font-bold sm:-mx-4 ${compact ? "lg:-mx-2.5" : ""}`
                : `${STAGE_TITLE} block text-[33px] ${compact ? "lg:text-2xl" : ""}`
            }
          >
            {card.title}
          </span>
        </div>
        {card.posterBottomLine ? (
          <div
            className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pt-8 pb-3 sm:px-4 sm:pt-10 sm:pb-4 ${
              compact ? "lg:px-2.5 lg:pt-6 lg:pb-2.5" : ""
            }`}
          >
            <span
              lang="he"
              dir="rtl"
              className={`block whitespace-nowrap text-center font-poster leading-snug text-brand-yellow text-[13px] min-[360px]:text-[15px] ${compact ? "lg:text-[14px]" : ""}`}
            >
              {card.posterBottomLine}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  if (card.theme === "office") {
    return (
      <div className="relative h-full w-full">
        <Image
          src={encodeURI(card.image)}
          alt=""
          fill
          sizes="(max-width: 640px) 75vw, 22rem"
          className={`object-cover object-[50%_70%] ${CARD_IMAGE_CLASS} ${
            isActive ? "brightness-110" : ""
          }`}
        />
        <div
          className={`absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-white/80 via-white/45 to-transparent px-3 pt-2 pb-8 sm:px-4 sm:pt-3 sm:pb-10 ${
            compact ? "lg:px-2.5 lg:pt-1.5 lg:pb-6" : ""
          }`}
        >
          <span lang="he" dir="rtl" className={`${POSTER_TITLE} text-[38px] font-bold !text-magenta`}>
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
        className={`object-cover object-[50%_75%] ${CARD_IMAGE_CLASS} ${
          isActive ? "brightness-110" : ""
        }`}
      />
      <span className="sr-only">{card.title}</span>
    </>
  );
}
