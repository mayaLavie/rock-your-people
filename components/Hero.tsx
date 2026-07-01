import Image from "next/image";
import {
  EXPERIENCES_SECTION_OFFERINGS_HE,
  EXPERIENCES_SECTION_SUBTITLE_HE,
  TITLE_IMAGE,
} from "@/lib/constants";

export function Hero() {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-x-hidden px-4 pb-4 sm:px-6 sm:pb-6 lg:px-4 lg:pb-6"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">
        <h1 id="hero-heading" className="sr-only">
          Rock Your People
        </h1>

        <div className="flex flex-1 flex-col justify-end lg:hidden">
          <div className="flex items-end gap-2.5 sm:gap-3">
            <div className="w-full max-w-[180px] shrink-0 sm:max-w-[220px] md:max-w-[240px]">
              <Image
                src={TITLE_IMAGE.src}
                alt={TITLE_IMAGE.alt}
                width={TITLE_IMAGE.width}
                height={TITLE_IMAGE.height}
                priority
                className="h-auto w-full"
              />
            </div>
            <p
              lang="he"
              dir="rtl"
              className="min-w-0 flex-1 pb-0.5 text-right font-hebrew text-pretty text-[15px] font-medium leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_SUBTITLE_HE}
            </p>
          </div>
          <p
            lang="he"
            dir="rtl"
            className="mt-[7px] w-full text-center font-hebrew text-pretty text-[16px] font-medium leading-snug text-cream/90"
          >
            {EXPERIENCES_SECTION_OFFERINGS_HE}
          </p>
        </div>

        <div className="mt-3 hidden shrink-0 lg:mt-auto lg:block">
          <div className="pb-3 text-center">
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl font-hebrew text-pretty text-[20px] font-medium leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_SUBTITLE_HE}
            </p>
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl pt-1 font-hebrew text-pretty text-[14px] font-medium leading-snug text-cream/90"
            >
              {EXPERIENCES_SECTION_OFFERINGS_HE}
            </p>
          </div>
          <div className="h-2.5 w-full bg-[#FBEEE3]" aria-hidden />
        </div>
      </div>
    </section>
  );
}
