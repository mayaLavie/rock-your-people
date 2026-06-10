import {
  EXPERIENCES_SECTION_OFFERINGS_HE,
  EXPERIENCES_SECTION_SUBTITLE_HE,
  EXPERIENCES_SECTION_TAGLINE_HE,
} from "@/lib/constants";
import { ExperienceCarousel } from "@/components/ExperienceCarousel";

export function ProductCards() {
  return (
    <section
      id="products"
      className="relative flex h-[calc(100dvh-50px)] flex-col overflow-hidden bg-magenta px-4 pt-[35px] pb-0 md:h-auto md:min-h-0 md:overflow-visible md:px-6 md:py-8 lg:px-10 lg:py-10"
      aria-labelledby="products-heading"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="shrink-0 w-full text-center">
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl text-center font-hebrew text-pretty text-[20px] font-medium leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_SUBTITLE_HE}
            </p>
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl pt-1 text-center font-hebrew text-pretty text-[14px] font-medium leading-snug text-cream/90"
            >
              {EXPERIENCES_SECTION_OFFERINGS_HE}
            </p>
            <div className="mx-auto w-fit pt-[60px]">
              <h2
                id="products-heading"
                className="font-display text-[32px] uppercase leading-none text-cream sm:text-[34px]"
              >
                choose your engagement
              </h2>
              <h3
                lang="he"
                dir="rtl"
                className="mx-auto max-w-3xl pt-[10px] text-center font-hebrew text-pretty text-[16px] font-semibold leading-snug text-cream"
              >
                {EXPERIENCES_SECTION_TAGLINE_HE}
              </h3>
            </div>
          </div>

          <div className="mt-auto mb-8 w-full shrink-0 overflow-hidden pb-1 md:mb-0 md:overflow-visible md:pb-0">
            <ExperienceCarousel />
          </div>
        </div>
      </div>
      <div
        className="h-2.5 w-full shrink-0 bg-[#FBEEE3] md:hidden"
        aria-hidden
      />
    </section>
  );
}
