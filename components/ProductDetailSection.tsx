import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { TRIO_360_SECTION_BG } from "@/lib/constants";

const STAGE_SECTION_BG_SRC = "/images/page%201%20F.png";

type ProductDetail = (typeof import("@/lib/product-details").PRODUCT_DETAIL_SECTIONS)[number];

const HEBREW_SUBHEADLINE =
  "mt-6 text-xl font-medium leading-snug sm:text-2xl";
const HEBREW_BODY = "mt-6 max-w-xl text-base leading-relaxed sm:text-lg";
const HEBREW_BULLETS = "mt-8 space-y-3";
const DETAIL_HEADLINE =
  "font-display text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl";
const DETAIL_CTA =
  "inline-flex w-fit border px-6 py-2 text-sm font-medium tracking-wide transition";
const DETAIL_SECTION_PAD = "px-4 py-16 sm:px-6 sm:py-20 lg:px-10";
const STAGE_SECTION_PAD =
  "px-4 pb-16 pt-[40px] sm:px-6 sm:pb-20 sm:pt-[40px] lg:px-10";
const WORKSHOP_SECTION_PAD =
  "px-4 pb-16 pt-[20px] sm:px-6 sm:pb-20 sm:pt-[20px] lg:px-10";

type ProductDetailSectionProps = {
  detail: ProductDetail;
};

function HebrewSubheadline({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  return (
    <p lang="he" dir="rtl" className={`font-hebrew text-pretty ${className}`}>
      {children}
    </p>
  );
}

function HebrewBody({ className, children }: { className: string; children: string }) {
  return (
    <p lang="he" dir="rtl" className={`font-hebrew text-pretty ${className}`}>
      {children}
    </p>
  );
}

function HebrewBodyParagraphs({
  className,
  paragraphs,
}: {
  className: string;
  paragraphs: readonly string[];
}) {
  return (
    <>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          lang="he"
          dir="rtl"
          className={`font-hebrew text-pretty ${className}`}
        >
          {paragraph}
        </p>
      ))}
    </>
  );
}

function HebrewBulletsHeading({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  return (
    <p lang="he" dir="rtl" className={`font-hebrew text-pretty ${className}`}>
      {children}
    </p>
  );
}

function HebrewBullets({
  className,
  items,
}: {
  className: string;
  items: readonly string[];
}) {
  return (
    <ul lang="he" dir="rtl" className={`font-hebrew ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-relaxed sm:text-lg">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function HebrewCta({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  return (
    <Link href="#contact" lang="he" className={`font-hebrew ${className}`}>
      {children}
    </Link>
  );
}

/** RTL Hebrew copy block — flush right on LTR pages */
function HebrewCopyBlock({ children }: { children: ReactNode }) {
  return (
    <div lang="he" dir="rtl" className="w-full text-right">
      {children}
    </div>
  );
}

export function ProductDetailSection({ detail }: ProductDetailSectionProps) {
  if (detail.theme === "trio") {
    return <Trio360Detail detail={detail} />;
  }
  if (detail.theme === "stage") {
    return <YourPeopleOnStageDetail detail={detail} />;
  }
  return <LeadershipWorkshopDetail detail={detail} />;
}

function DetailContent({
  headingId,
  headline,
  headlineSlot,
  subheadlineSlot,
  subheadline,
  bodySlot,
  body,
  bulletsSlot,
  bullets,
  ctaSlot,
  cta,
  headlineClass,
  subheadlineClass,
  bodyClass,
  bulletClass,
  ctaClass,
}: {
  headingId: string;
  headline: string;
  headlineSlot?: ReactNode;
  subheadlineSlot?: ReactNode;
  subheadline: string;
  bodySlot?: ReactNode;
  body: string;
  bulletsSlot?: ReactNode;
  bullets: readonly string[];
  ctaSlot?: ReactNode;
  cta: string;
  headlineClass: string;
  subheadlineClass: string;
  bodyClass: string;
  bulletClass: string;
  ctaClass: string;
}) {
  return (
    <div className="flex flex-col justify-center">
      {headlineSlot ?? (
        <h2 id={headingId} className={headlineClass}>
          {headline}
        </h2>
      )}
      {subheadlineSlot ?? <p className={subheadlineClass}>{subheadline}</p>}
      {bodySlot ?? <p className={bodyClass}>{body}</p>}
      {bulletsSlot ?? (
        <ul className={`mt-8 space-y-3 ${bulletClass}`}>
          {bullets.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed sm:text-lg">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {ctaSlot ?? (
        <Link href="#contact" className={ctaClass}>
          {cta}
        </Link>
      )}
    </div>
  );
}

function HebrewDetailCopy({
  detail,
  subheadlineClass,
  bodyClass,
  bulletClass,
  bulletsHeadingClass,
  ctaClass,
}: {
  detail: ProductDetail;
  subheadlineClass: string;
  bodyClass: string;
  bulletClass: string;
  bulletsHeadingClass?: string;
  ctaClass: string;
}) {
  const bodyParagraphs =
    "bodyParagraphs" in detail && detail.bodyParagraphs.length > 0
      ? detail.bodyParagraphs
      : null;
  const bulletsHeading =
    "bulletsHeading" in detail ? detail.bulletsHeading : "";
  const closingBody = "closingBody" in detail ? detail.closingBody : "";

  return {
    subheadlineSlot: (
      <HebrewSubheadline className={subheadlineClass}>{detail.subheadline}</HebrewSubheadline>
    ),
    bodySlot: bodyParagraphs ? (
      <HebrewBodyParagraphs className={bodyClass} paragraphs={bodyParagraphs} />
    ) : detail.body ? (
      <HebrewBody className={bodyClass}>{detail.body}</HebrewBody>
    ) : null,
    bulletsHeadingSlot:
      bulletsHeading && bulletsHeadingClass ? (
        <HebrewBulletsHeading className={bulletsHeadingClass}>
          {bulletsHeading}
        </HebrewBulletsHeading>
      ) : null,
    bulletsSlot:
      detail.bullets.length > 0 ? (
        <HebrewBullets className={bulletClass} items={detail.bullets} />
      ) : null,
    closingBodySlot: closingBody ? (
      <HebrewBody className={bodyClass}>{closingBody}</HebrewBody>
    ) : null,
    ctaSlot: <HebrewCta className={ctaClass}>{detail.cta}</HebrewCta>,
  };
}

function Trio360Detail({ detail }: ProductDetailSectionProps) {
  const hebrew = HebrewDetailCopy({
    detail,
    subheadlineClass:
      "mt-6 text-[22px] font-medium leading-snug text-[#ff4e1a]",
    bodyClass: "mt-6 max-w-xl text-[20px] leading-relaxed text-[#3D2E2A]",
    bulletClass: `${HEBREW_BULLETS} text-[20px] text-[#3D2E2A]`,
    ctaClass: `${DETAIL_CTA} mt-10 border-[#D72866] bg-[#D72866] text-cream hover:bg-transparent hover:text-[#D72866]`,
  });

  return (
    <section
      id={detail.id}
      className="overflow-hidden bg-cream-muted"
      aria-labelledby={`${detail.id}-heading`}
    >
      <div className="relative w-full">
        <div className="relative aspect-[3/2] w-full sm:aspect-[16/9]">
          <Image
            src={encodeURI(TRIO_360_SECTION_BG.src)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-cream-muted/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cream-muted/95 via-cream-muted/50 to-transparent sm:h-32"
            aria-hidden
          />
          <h2
            id={`${detail.id}-heading`}
            className="absolute inset-x-0 top-4 z-10 text-center font-display text-5xl uppercase leading-none sm:top-6 sm:text-6xl lg:text-7xl"
          >
            <span className="text-[#ff4e1a]">Trio 360</span>
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-8 lg:max-w-4xl lg:px-10 lg:pb-32">
        <HebrewCopyBlock>
          {hebrew.subheadlineSlot}
          {hebrew.bodySlot}
          {hebrew.bulletsSlot}
          {hebrew.ctaSlot}
        </HebrewCopyBlock>
      </div>
    </section>
  );
}

function YourPeopleOnStageDetail({ detail }: ProductDetailSectionProps) {
  const hebrew = HebrewDetailCopy({
    detail,
    subheadlineClass: `${HEBREW_SUBHEADLINE} text-[#FBEEE3]`,
    bodyClass: "mt-[10px] max-w-xl text-base leading-relaxed sm:text-lg text-[#FBEEE3]/90",
    bulletClass: "mt-[10px] space-y-1.5 text-[#FBEEE3]",
    ctaClass: `${DETAIL_CTA} mt-6 border-[#FFE34D] bg-[#FFE34D] text-[#1e1c1c] hover:bg-transparent hover:text-[#FFE34D]`,
  });

  return (
    <section
      id={detail.id}
      className={`relative min-h-dvh overflow-hidden bg-[#1e1c1c] md:min-h-0 ${STAGE_SECTION_PAD}`}
      aria-labelledby={`${detail.id}-heading`}
    >
      <Image
        src={STAGE_SECTION_BG_SRC}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-left sm:object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[#1e1c1c]/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1e1c1c] via-[#1e1c1c]/40 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl lg:max-w-4xl">
        <h2
          id={`${detail.id}-heading`}
          className={`${DETAIL_HEADLINE} text-[#FFE34D]`}
        >
          {detail.headline}
        </h2>
        <HebrewCopyBlock>
          {hebrew.subheadlineSlot}
          {hebrew.bodySlot}
          {hebrew.bulletsSlot}
          {hebrew.ctaSlot}
        </HebrewCopyBlock>
      </div>
    </section>
  );
}

function LeadershipWorkshopDetail({ detail }: ProductDetailSectionProps) {
  const bodyClass = `${HEBREW_BODY} text-[#06131D]/85`;
  const hebrew = HebrewDetailCopy({
    detail,
    subheadlineClass: `${HEBREW_SUBHEADLINE} text-[#FBEEE3]`,
    bodyClass,
    bulletClass: `${HEBREW_BULLETS} text-[#06131D]`,
    bulletsHeadingClass: "mt-8 text-lg font-medium text-[#FAF0E4] sm:text-xl",
    ctaClass: `${DETAIL_CTA} mt-10 border-[#06131D] bg-[#06131D] text-[#FAF0E4] hover:bg-transparent hover:text-[#06131D]`,
  });

  return (
    <section
      id={detail.id}
      className={`relative z-10 -mt-1 min-h-[calc(100dvh-var(--site-header-height))] overflow-hidden bg-[#6DB380] md:min-h-0 ${WORKSHOP_SECTION_PAD}`}
      aria-labelledby={`${detail.id}-heading`}
    >
      <div className="relative mx-auto max-w-3xl lg:max-w-4xl">
        <h2
          id={`${detail.id}-heading`}
          className={`${DETAIL_HEADLINE} text-[#FAF0E4]`}
        >
          {detail.headline}
        </h2>
        <HebrewCopyBlock>
          {hebrew.subheadlineSlot}
          {hebrew.bodySlot}
          {hebrew.bulletsHeadingSlot}
          {hebrew.bulletsSlot}
          {hebrew.closingBodySlot}
          {hebrew.ctaSlot}
        </HebrewCopyBlock>
      </div>
      <div className="h-2.5 w-full shrink-0 md:hidden" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-[10px] h-2.5 bg-[#FBEEE3] md:hidden"
        aria-hidden
      />
    </section>
  );
}
