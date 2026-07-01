import Image from "next/image";
import {
  EXPERIENCES_INTRO_PARAGRAPHS,
  EXPERIENCES_INTRO_STAGE_IMAGE,
  EXPERIENCES_SECTION_DESCRIPTION_HE,
  EXPERIENCES_SECTION_SCHEDULE_INTRO_HE,
  EXPERIENCES_SECTION_SUBTITLE_HE,
  EXPERIENCES_SECTION_TAGLINE_HE,
  EXPERIENCES_SECTION_TITLE_HE,
  EXPERIENCES_SECTION_USE_CASES,
} from "@/lib/constants";
import { ExperienceCarousel } from "@/components/ExperienceCarousel";

export function ProductCards() {
  return (
    <>
      <section
        id="products"
        className="relative flex flex-col overflow-x-hidden bg-cream px-4 pt-0 pb-10 md:px-6 md:pb-6 md:pt-0 lg:min-h-0 lg:overflow-visible lg:px-4 lg:py-6 lg:pt-7 lg:pb-6"
        aria-labelledby="products-heading"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="-mx-4 mt-[10px] bg-magenta px-4 py-3 text-center md:-mx-6 md:px-6 lg:hidden">
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl font-hebrew text-pretty text-[24px] font-medium leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_SUBTITLE_HE}
            </p>
          </div>
          <div className="mt-5 lg:hidden">
            <div
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl space-y-3 text-center font-hebrew text-pretty text-[17px] font-bold leading-relaxed text-magenta/90"
            >
              {EXPERIENCES_INTRO_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className="m-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="-mx-4 mt-4 overflow-hidden md:-mx-6">
              <Image
                src={EXPERIENCES_INTRO_STAGE_IMAGE.src}
                alt={EXPERIENCES_INTRO_STAGE_IMAGE.alt}
                width={EXPERIENCES_INTRO_STAGE_IMAGE.width}
                height={EXPERIENCES_INTRO_STAGE_IMAGE.height}
                className="h-auto w-full"
                sizes="100vw"
              />
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-3xl lg:mt-0">
            <div
              lang="he"
              dir="rtl"
              className="text-center font-hebrew text-pretty leading-relaxed text-magenta/90"
            >
              <h2
                id="products-heading"
                className="m-0 text-[22px] font-bold leading-snug text-magenta lg:text-[30px]"
              >
                <span className="lg:hidden">
                  {EXPERIENCES_SECTION_TITLE_HE.replace(/\.$/, "")}
                </span>
                <span className="hidden lg:inline">{EXPERIENCES_SECTION_TITLE_HE}</span>
              </h2>
              <p className="m-0 mt-[10px] text-[17px] font-bold">
                {EXPERIENCES_SECTION_DESCRIPTION_HE}
              </p>
            </div>
            <div className="mt-4 hidden overflow-hidden lg:-mx-4 lg:block">
              <Image
                src={EXPERIENCES_INTRO_STAGE_IMAGE.src}
                alt={EXPERIENCES_INTRO_STAGE_IMAGE.alt}
                width={EXPERIENCES_INTRO_STAGE_IMAGE.width}
                height={EXPERIENCES_INTRO_STAGE_IMAGE.height}
                className="h-auto w-full"
                sizes="480px"
              />
            </div>
            <div
              lang="he"
              dir="rtl"
              className="mt-[10px] text-right font-hebrew text-pretty leading-relaxed text-magenta/90"
            >
              <p className="m-0 text-[15px] font-normal lg:text-[17px] lg:font-bold">
                {EXPERIENCES_SECTION_SCHEDULE_INTRO_HE}
              </p>
              <ul className="m-0 mt-[10px] list-none space-y-2 p-0 text-[15px] font-normal lg:text-[17px] lg:font-bold">
              {EXPERIENCES_SECTION_USE_CASES.map((item) => (
                <li
                  key={item}
                  className="m-0 flex flex-row-reverse items-start justify-end gap-2"
                >
                  <span>{item}</span>
                  <span aria-hidden="true">★</span>
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-[10px] h-2.5 bg-magenta md:hidden"
          aria-hidden
        />
      </section>

      <section
        id="engagement"
        className="relative flex flex-col overflow-x-hidden overflow-y-visible bg-magenta px-4 pt-8 pb-10 md:px-6 md:py-8 lg:overflow-visible lg:px-4 lg:py-6 lg:pt-7 lg:pb-6"
        aria-labelledby="engagement-heading"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mx-auto w-fit text-center">
            <p
              id="engagement-heading"
              className="font-display text-[32px] uppercase leading-none text-cream sm:text-[34px]"
            >
              choose your engagement
            </p>
            <h3
              lang="he"
              dir="rtl"
              className="mx-auto hidden max-w-3xl pt-[10px] text-center font-hebrew text-pretty text-[16px] font-semibold leading-snug text-cream lg:block"
            >
              {EXPERIENCES_SECTION_TAGLINE_HE}
            </h3>
          </div>

          <div className="products-carousel-slot mt-5 w-full overflow-visible pb-1 lg:mt-4 lg:pb-0">
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

        <div
          className="absolute inset-x-0 bottom-[10px] h-2.5 bg-[#FBEEE3] md:hidden"
          aria-hidden
        />
      </section>
    </>
  );
}
