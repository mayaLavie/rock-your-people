"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EXPERIENCES_CARD_HEADLINE_HE,
  EXPERIENCES_SECTION_TAGLINE_HE,
  PRODUCTS,
} from "@/lib/constants";

const STAGE_IMAGE_SRC = "/images/gemini band pic.png";
const TRIO_IMAGE_SRC = "/images/Screenshot trio 360.png";
const WORKSHOP_IMAGE_SRC = "/images/workshop4.png";

const CARD_BORDER =
  "border-2 border-cream transition-[border-color,box-shadow] duration-300 group-hover:border-[#FBEEE3] group-hover:shadow-[0_0_0_1px_#FBEEE3,0_16px_40px_rgba(0,0,0,0.45)] sm:border-[3px]";
const CARD_IMAGE_CLASS =
  "transition duration-500 ease-out group-hover:scale-[1.06] group-hover:brightness-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100";
const STAGE_TITLE =
  "font-stage-title uppercase leading-none tracking-wide text-brand-yellow";

const STAGE_PRODUCT_ID = "your-people-on-stage";
const DEFAULT_CARD_INDEX = 1;

/** Trio — Stage (center default) — Workshop */
const CAROUSEL_PRODUCTS = [
  PRODUCTS.find((p) => p.id === "trio-360")!,
  PRODUCTS.find((p) => p.id === STAGE_PRODUCT_ID)!,
  PRODUCTS.find((p) => p.id === "musical-leadership-workshop")!,
];

const CARD_FRAME_CLASS =
  "aspect-[3/4] w-[78vw] max-h-full max-w-[17.5rem] sm:w-[19.5rem] sm:max-h-none sm:max-w-[19.5rem] md:w-[21rem] md:max-w-[21rem] lg:w-[22rem] lg:max-w-[22rem]";

const CARD_LINK_INTERACTION_CLASS =
  "group block cursor-pointer overflow-hidden transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100";

const ARROW_BUTTON_CLASS =
  "flex shrink-0 items-center justify-center p-1 text-cream transition hover:opacity-75 disabled:pointer-events-none disabled:opacity-25";

const DETAIL_HREF: Record<(typeof PRODUCTS)[number]["id"], string> = {
  "trio-360": "#trio-360",
  "your-people-on-stage": "#your-people-on-stage",
  "musical-leadership-workshop": "#leadership-workshop",
};

const HEADLINE_FADE_MS = 400;
const DEFAULT_HEADLINE =
  EXPERIENCES_CARD_HEADLINE_HE[CAROUSEL_PRODUCTS[DEFAULT_CARD_INDEX]!.id];

function CardHeadline({ headline }: { headline: string }) {
  const [renderedHeadline, setRenderedHeadline] = useState(DEFAULT_HEADLINE);
  const [visible, setVisible] = useState(true);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (headline === renderedHeadline) {
      setVisible(true);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setRenderedHeadline(headline);
      setVisible(true);
      return;
    }

    setVisible(false);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setRenderedHeadline(headline);
      setVisible(true);
      fadeTimeoutRef.current = null;
    }, HEADLINE_FADE_MS);

    return () => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, [headline, renderedHeadline]);

  return (
    <p
      lang="he"
      dir="rtl"
      aria-live="polite"
      className={`min-h-[1.4em] pb-[5px] text-center font-hebrew text-[15px] font-semibold text-cream transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {renderedHeadline}
    </p>
  );
}

export function ProductCards() {
  const scrollRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_CARD_INDEX);

  const scrollToIndex = useCallback((index: number) => {
    const list = scrollRef.current;
    const card = cardRefs.current[index];
    if (!list || !card) return;

    list.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;

    function syncActiveIndex() {
      const listEl = scrollRef.current;
      if (!listEl || listEl.clientWidth === 0) return;

      const index = Math.round(listEl.scrollLeft / listEl.clientWidth);
      setActiveIndex(Math.min(Math.max(index, 0), CAROUSEL_PRODUCTS.length - 1));
    }

    function scrollToDefault() {
      const listEl = scrollRef.current;
      const card = cardRefs.current[DEFAULT_CARD_INDEX];
      if (!listEl || !card) return;

      listEl.scrollLeft = card.offsetLeft;
      setActiveIndex(DEFAULT_CARD_INDEX);
    }

    scrollToDefault();
    const rafId = requestAnimationFrame(scrollToDefault);
    list.addEventListener("scroll", syncActiveIndex, { passive: true });
    window.addEventListener("resize", scrollToDefault);

    return () => {
      cancelAnimationFrame(rafId);
      list.removeEventListener("scroll", syncActiveIndex);
      window.removeEventListener("resize", scrollToDefault);
    };
  }, []);

  const activeHeadline =
    EXPERIENCES_CARD_HEADLINE_HE[CAROUSEL_PRODUCTS[activeIndex]!.id];

  return (
    <section
      id="products"
      className="relative flex h-[calc(100dvh-50px)] flex-col bg-magenta px-4 pt-[35px] pb-0 md:h-auto md:min-h-0 md:px-6 md:py-8 lg:px-10 lg:py-10"
      aria-labelledby="products-heading"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col md:flex-none">
        <div className="flex min-h-0 flex-1 flex-col justify-between md:flex-none md:justify-start">
          <div className="w-full text-center">
            <div className="mx-auto w-fit">
              <h2
                id="products-heading"
                className="font-display text-[38px] uppercase leading-none text-cream"
              >
                <span className="block text-left">Our</span>
                <span className="block">experiences</span>
              </h2>
            </div>
            <h3
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl pt-[10px] text-center font-hebrew text-pretty text-[16px] font-semibold leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_TAGLINE_HE}
            </h3>
          </div>

          <div className="mb-[50px] shrink-0 md:mb-0 md:mt-[40px]">
          <CardHeadline headline={activeHeadline} />
          <div
            className="flex items-center gap-1.5 sm:gap-3"
            aria-label="Our experiences — swipe or use arrows to explore"
          >
            <button
              type="button"
              className={ARROW_BUTTON_CLASS}
              aria-label="Previous experience"
              disabled={activeIndex === 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <TriangleArrow direction="left" />
            </button>

            <div className="experiences-scroll min-w-0 flex-1 overflow-hidden">
              <ul
                ref={scrollRef}
                className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
              >
                {CAROUSEL_PRODUCTS.map((product, index) => (
                  <li
                    key={product.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className="flex w-full shrink-0 snap-center justify-center"
                  >
                    <a
                      href={DETAIL_HREF[product.id]}
                      className={`${CARD_FRAME_CLASS} ${CARD_LINK_INTERACTION_CLASS}`}
                      aria-label={`Learn more about ${product.title}`}
                    >
                      <ProductCard product={product} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={ARROW_BUTTON_CLASS}
              aria-label="Next experience"
              disabled={activeIndex === CAROUSEL_PRODUCTS.length - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <TriangleArrow direction="right" />
            </button>
          </div>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-4 bottom-[15px] h-2.5 bg-[#FBEEE3] md:hidden"
        aria-hidden
      />
    </section>
  );
}

function TriangleArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      className="h-7 w-6 sm:h-10 sm:w-8"
      viewBox="0 0 28 36"
      fill="currentColor"
    >
      {direction === "left" ? (
        <polygon points="24,3 24,33 5,18" />
      ) : (
        <polygon points="4,3 4,33 23,18" />
      )}
    </svg>
  );
}

type Product = (typeof PRODUCTS)[number];

function ProductCard({ product }: { product: Product }) {
  if (product.variant === "stage") {
    return (
      <article
        className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
      >
        <Image
          src={encodeURI(STAGE_IMAGE_SRC)}
          alt=""
          fill
          sizes="(max-width: 640px) 80vw, 22rem"
          className={`scale-110 object-cover object-[50%_115%] ${CARD_IMAGE_CLASS}`}
        />
        <div className="relative z-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-3 sm:p-4">
          <h3 className={`${STAGE_TITLE} text-lg sm:text-xl md:text-2xl`}>
            {product.title}
          </h3>
        </div>
      </article>
    );
  }

  if (product.variant === "trio") {
    return (
      <article
        className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
      >
        <Image
          src={encodeURI(TRIO_IMAGE_SRC)}
          alt=""
          fill
          sizes="(max-width: 640px) 80vw, 22rem"
          className={`object-cover object-center ${CARD_IMAGE_CLASS}`}
        />
        <h3 className="sr-only">Trio 360</h3>
      </article>
    );
  }

  return (
    <article
      className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
    >
      <Image
        src={encodeURI(WORKSHOP_IMAGE_SRC)}
        alt=""
        fill
        sizes="(max-width: 640px) 78vw, 22rem"
        className={`object-cover object-center ${CARD_IMAGE_CLASS}`}
      />
      <h3 className="sr-only">{product.title}</h3>
    </article>
  );
}
