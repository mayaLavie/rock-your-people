import { CtaLink } from "@/components/CtaLink";
import { ScrollDownHint } from "@/components/ScrollDownHint";
import {
  HERO_CTA_HE,
  HERO_CTA_MICROCOPY_HE,
  HERO_HEADLINE_HE,
  HERO_SECONDARY_LINK_HE,
  HERO_SUBLINE_HE,
  EXPERIENCES_INTRO_PARAGRAPHS,
} from "@/lib/constants";

const BRAND_SLOGAN_HE = EXPERIENCES_INTRO_PARAGRAPHS[0];

function HeroActions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <CtaLink
        href="#contact"
        placement="hero"
        className="w-full max-w-[22rem] text-[17px]"
      >
        {HERO_CTA_HE}
      </CtaLink>
      <p
        lang="he"
        dir="rtl"
        className="mt-2 text-center font-hebrew text-[14px] font-medium leading-snug text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
      >
        {HERO_CTA_MICROCOPY_HE}
      </p>
      <a
        href="#engagement"
        lang="he"
        dir="rtl"
        data-placement="hero-secondary"
        className="mt-1 inline-flex min-h-[44px] items-center justify-center px-4 font-hebrew text-[16px] font-semibold text-cream underline underline-offset-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.45),0_2px_12px_rgba(0,0,0,0.5)] hover:text-white"
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
        {/* Mobile / tablet: the logo lives in the header, so the slogan appears just below, over the products photo.
            The invisible data-hero-logo marker is where the teaser donkey lands (to the right). */}
        <div className="flex min-h-[calc(var(--site-header-height)+40px)] items-start pt-[calc(var(--site-header-height)+0.5rem)] lg:hidden">
          <div className="w-[180px] shrink-0 sm:w-[200px]">
            <div data-hero-logo aria-hidden className="h-px w-[128px] sm:w-[150px]" />
          </div>
        </div>

        <div className="mt-1 flex flex-col lg:mt-auto">
          <div className="relative pb-3 text-center">
            {/* Mid-size desktops have no side logo: keep the slogan once here. */}
            <p
              lang="he"
              dir="rtl"
              className="hidden pb-2 font-hebrew text-[18px] font-bold text-cream lg:block xl:hidden"
            >
              {BRAND_SLOGAN_HE}
            </p>
            <h1
              id="hero-heading"
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl font-hebrew text-balance text-[30px] font-extrabold leading-[1.15] text-cream [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] lg:text-[34px]"
            >
              {HERO_HEADLINE_HE}
            </h1>
            <div className="relative mx-auto max-w-3xl">
              <div
                data-donkey-anchor
                className="absolute bottom-full right-0 z-20 mb-5 hidden lg:block"
              >
                <ScrollDownHint />
              </div>
              <p
                lang="he"
                dir="rtl"
                className="mt-2 font-hebrew text-pretty text-[17px] font-medium leading-snug text-cream [text-shadow:0_1px_3px_rgba(0,0,0,0.45),0_2px_12px_rgba(0,0,0,0.5)] lg:pt-1 lg:text-[21px]"
              >
                {HERO_SUBLINE_HE}
              </p>
              <HeroActions className="mt-4" />
            </div>
          </div>
          <div className="hidden h-2.5 w-full bg-[#FBEEE3] lg:block" aria-hidden />
        </div>

        {/* Mobile scroll cue sits at the bottom of the fold, clear of the CTA. */}
        <div className="mt-auto flex justify-center pt-4 lg:hidden">
          <ScrollDownHint />
        </div>
      </div>
    </section>
  );
}
