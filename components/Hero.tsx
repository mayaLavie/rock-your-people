import Image from "next/image";
import { CtaLink } from "@/components/CtaLink";
import { ScrollDownHint } from "@/components/ScrollDownHint";
import {
  EXPERIENCES_SECTION_OFFERINGS_HE,
  HERO_AUDIENCE_HE,
  HERO_CTA_HE,
  HERO_SECONDARY_LINK_HE,
  TITLE_IMAGE,
} from "@/lib/constants";

function HeroActions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <CtaLink href="#contact" className="w-full max-w-[22rem] text-[17px]">
        {HERO_CTA_HE}
      </CtaLink>
      <a
        href="#engagement"
        lang="he"
        dir="rtl"
        className="inline-flex min-h-[44px] items-center justify-center px-4 font-hebrew text-[16px] font-semibold text-cream underline underline-offset-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)] hover:text-white"
      >
        {HERO_SECONDARY_LINK_HE}
      </a>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-x-hidden px-4 pb-4 sm:px-6 sm:pb-6 lg:px-4 lg:pb-[calc(var(--desktop-site-header-height)+6.5rem)]"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">
        <h1 id="hero-heading" className="sr-only">
          Rock Your People
        </h1>

        <div className="flex flex-1 flex-col justify-end lg:hidden">
          <div className="flex items-end gap-4">
            <div
              data-hero-logo
              className="w-full max-w-[180px] shrink-0 sm:max-w-[220px] md:max-w-[240px]"
            >
              <Image
                src={TITLE_IMAGE.src}
                alt={TITLE_IMAGE.alt}
                width={TITLE_IMAGE.width}
                height={TITLE_IMAGE.height}
                priority
                className="h-auto w-full"
              />
            </div>
            <ScrollDownHint />
          </div>
          <div className="relative mt-[7px] w-full">
            <p
              lang="he"
              dir="rtl"
              className="w-full text-center font-hebrew text-balance text-[21px] font-bold leading-snug text-cream [text-shadow:0_1px_10px_rgba(0,0,0,0.3)]"
            >
              {HERO_AUDIENCE_HE}
            </p>
            <p
              lang="he"
              dir="rtl"
              className="mt-1 w-full text-center font-hebrew text-pretty text-[16px] font-medium leading-snug text-cream/90"
            >
              {EXPERIENCES_SECTION_OFFERINGS_HE}
            </p>
            <HeroActions className="mt-3" />
          </div>
        </div>

        <div className="mt-3 hidden shrink-0 lg:mt-auto lg:block">
          <div className="relative pb-3 text-center">
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl font-hebrew text-pretty text-[26px] font-bold leading-snug text-cream"
            >
              {HERO_AUDIENCE_HE}
            </p>
            <div className="relative mx-auto max-w-3xl">
              <div data-donkey-anchor className="absolute bottom-full right-0 z-20 mb-5">
                <ScrollDownHint />
              </div>
              <p
                lang="he"
                dir="rtl"
                className="pt-1 font-hebrew text-pretty text-[23px] font-medium leading-snug text-cream/90"
              >
                {EXPERIENCES_SECTION_OFFERINGS_HE}
              </p>
              <HeroActions className="mt-3" />
            </div>
          </div>
          <div className="h-2.5 w-full bg-[#FBEEE3]" aria-hidden />
        </div>
      </div>
    </section>
  );
}
