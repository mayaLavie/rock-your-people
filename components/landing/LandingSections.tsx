import Image from "next/image";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import type { LandingBlock, LandingContent } from "@/lib/landing-content";

export const HERO_CTA_ID = "lp-hero-cta";

const H2 =
  "font-hebrew text-[28px] font-bold leading-tight text-[#FFE34D] sm:text-[34px]";

export function LandingHero({
  content,
  ctaLabel,
  whatsappUrl,
}: {
  content: LandingContent;
  ctaLabel: string;
  whatsappUrl: string;
}) {
  return (
    <section
      aria-labelledby="lp-hero-heading"
      className="border-b-[3px] border-cream bg-magenta px-4 pb-6 pt-3 sm:px-6 sm:pb-10 sm:pt-6 lg:px-10"
    >
      <div className="mx-auto grid max-w-[1100px] gap-4 md:grid-cols-2 md:gap-x-10 md:gap-y-6">
        <div className="relative h-[26dvh] min-h-[150px] w-full overflow-hidden rounded-[5px] border-[3px] border-cream md:col-start-2 md:row-span-2 md:row-start-1 md:h-[420px]">
          <Image
            src={encodeURI(content.hero.src)}
            alt={content.hero.alt}
            fill
            priority
            sizes="(min-width: 768px) 520px, 100vw"
            className="object-cover"
            style={{ objectPosition: content.hero.position }}
          />
        </div>

        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <p className="font-hebrew text-[14px] font-semibold leading-snug text-cream/90 sm:text-base">
            {content.audience}
          </p>
          <h1
            id="lp-hero-heading"
            className={`mt-1 text-[40px] leading-none text-cream sm:text-6xl ${
              /[\u0590-\u05FF]/.test(content.name)
                ? "font-hebrew font-extrabold"
                : "font-display uppercase"
            }`}
          >
            {content.name}
          </h1>
          <p className="mt-2 font-hebrew text-pretty text-[17px] font-medium leading-snug text-cream sm:mt-4 sm:text-xl">
            {content.valueLine}
          </p>
        </div>

        <div className="flex flex-col gap-2 md:col-start-1 md:row-start-2 md:flex-row md:flex-wrap md:items-start md:gap-4">
          <a
            id={HERO_CTA_ID}
            data-placement="lp-hero"
            href="#contact"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[5px] border border-[#FFE34D] bg-[#FFE34D] px-6 font-hebrew text-base font-bold text-[#1e1c1c] transition hover:bg-transparent hover:text-[#FFE34D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream md:w-auto md:min-w-[260px]"
          >
            {ctaLabel}
          </a>
          <a
            href={whatsappUrl}
            data-placement="lp-hero-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[5px] border-2 border-cream px-6 font-hebrew text-[15px] font-semibold text-cream transition hover:bg-cream/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream md:w-auto"
          >
            <WhatsAppIcon />
            או ישירות בוואטסאפ
          </a>
        </div>

        <p
          data-testid="lp-trust-line"
          className="font-hebrew text-[14px] font-medium leading-snug text-cream/95 sm:text-[15px] md:col-start-1 md:row-start-3"
        >
          להקה מקצועית עם שנים של ניסיון על במות ובהפקות חיות.{" "}
          <a
            href="#reviews"
            data-placement="lp-hero-reviews"
            className="font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            קראו מה כתבו מי שכבר חוו אותנו
          </a>
        </p>
      </div>
    </section>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => {
        const sep = item.search(/[:.] /);
        const hasLabel = sep > 0 && sep < 40;
        const label = hasLabel ? item.slice(0, sep + 1) : null;
        const rest = hasLabel ? item.slice(sep + 1).trimStart() : item;
        const emoji = /^\p{Extended_Pictographic}/u.test(item);
        return (
          <li key={item} className="flex gap-3 text-base leading-relaxed sm:text-lg">
            {emoji ? null : (
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFE34D]"
              />
            )}
            <span>
              {label ? <strong className="font-bold">{label}</strong> : null}
              {label ? ` ${rest}` : rest}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function BlockBody({ block, headingLevel }: { block: LandingBlock; headingLevel: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <>
      {block.paragraphs?.map((p) => (
        <p key={p} className="mt-4 text-base leading-relaxed text-[#FBEEE3]/90 sm:text-lg">
          {p}
        </p>
      ))}
      {block.bulletsHeading ? (
        <Heading className="mt-6 text-xl font-bold text-[#FBEEE3]">{block.bulletsHeading}</Heading>
      ) : null}
      {block.bullets ? <Bullets items={block.bullets} /> : null}
      {block.closing ? (
        <p className="mt-6 text-base font-bold leading-relaxed text-[#FBEEE3] sm:text-lg">
          {block.closing}
        </p>
      ) : null}
    </>
  );
}

export function LandingExperience({ content }: { content: LandingContent }) {
  const { experience, extra } = content;
  return (
    <section
      aria-labelledby="lp-experience-heading"
      lang="he"
      dir="rtl"
      className="bg-[#1e1c1c] px-4 py-10 text-[#FBEEE3] sm:px-6 sm:py-14 lg:px-10"
    >
      <div className="mx-auto max-w-3xl font-hebrew">
        <h2 id="lp-experience-heading" className={H2}>
          {experience.heading}
        </h2>
        <BlockBody block={experience} headingLevel="h3" />

        {extra ? (
          <div
            data-product={extra.product}
            className="mt-10 border-t-[3px] border-[#FBEEE3]/30 pt-8"
          >
            <h3 className={H2}>{extra.heading}</h3>
            <BlockBody block={{ ...extra, heading: "" }} headingLevel="h3" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function LandingFits({
  content,
  intro,
}: {
  content: LandingContent;
  intro: string;
}) {
  const { fits } = content;
  return (
    <section
      aria-labelledby="lp-fits-heading"
      lang="he"
      dir="rtl"
      className="border-y-[3px] border-cream bg-cream-muted px-4 py-10 text-[#1e1c1c] sm:px-6 sm:py-14 lg:px-10"
    >
      <div className="mx-auto max-w-3xl font-hebrew">
        <h2
          id="lp-fits-heading"
          className="text-[28px] font-bold leading-tight text-[#D72866] sm:text-[34px]"
        >
          {fits.heading}
        </h2>
        <p className="mt-4 text-base leading-relaxed sm:text-lg">{fits.text}</p>
        <p className="mt-6 text-base font-semibold sm:text-lg">{intro}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {fits.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border-2 border-[#1e1c1c] px-4 py-1.5 text-[15px] font-semibold"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
