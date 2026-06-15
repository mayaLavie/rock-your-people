import {
  EXPERIENCES_INTRO_PARAGRAPHS,
  EXPERIENCES_SECTION_OFFERINGS_HE,
  EXPERIENCES_SECTION_SUBTITLE_HE,
  EXPERIENCES_SECTION_TAGLINE_HE,
} from "@/lib/constants";
import { ExperienceCarousel } from "@/components/ExperienceCarousel";

export function ProductCards() {
  return (
    <section
      id="products"
      className="relative flex flex-col overflow-x-hidden overflow-y-visible bg-magenta px-4 pt-[35px] pb-10 md:h-auto md:min-h-0 md:overflow-visible md:px-6 md:py-8 md:pb-8 lg:h-auto lg:min-h-0 lg:overflow-visible lg:px-4 lg:py-6 lg:pt-7 lg:pb-6"
      aria-labelledby="products-heading"
    >
      <div className="mx-auto w-full max-w-[1400px] md:flex md:min-h-0 md:flex-1 md:flex-col">
        <div className="flex flex-col gap-5 md:min-h-0 md:flex-1 md:flex-col md:justify-between lg:flex-none lg:gap-3">
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
            <div
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl space-y-3 pt-4 text-center font-hebrew text-pretty text-[14px] font-bold leading-relaxed text-cream/90 lg:hidden"
            >
              {EXPERIENCES_INTRO_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className="m-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mx-auto w-fit pt-[30px]">
              <h2
                id="products-heading"
                className="font-display text-[32px] uppercase leading-none text-cream sm:text-[34px]"
              >
                choose your engagement
              </h2>
              <h3
                lang="he"
                dir="rtl"
                className="mx-auto hidden max-w-3xl pt-[10px] text-center font-hebrew text-pretty text-[16px] font-semibold leading-snug text-cream lg:block"
              >
                {EXPERIENCES_SECTION_TAGLINE_HE}
              </h3>
            </div>
          </div>

          <div className="products-carousel-slot w-full shrink-0 overflow-visible pb-1 md:mb-0 md:mt-auto md:overflow-visible md:pb-0 lg:mt-0 lg:mb-0 lg:overflow-visible lg:pb-0">
            <ExperienceCarousel />
            <p
              lang="he"
              dir="rtl"
              className="mx-auto mt-6 mb-4 max-w-3xl text-center font-hebrew text-pretty text-[14px] font-semibold leading-snug text-cream lg:hidden"
            >
              {EXPERIENCES_SECTION_TAGLINE_HE}
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-[10px] h-2.5 bg-[#FBEEE3] md:hidden"
        aria-hidden
      />
    </section>
  );
}
