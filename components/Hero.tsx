import Image from "next/image";
import { ScrollDownHint } from "@/components/ScrollDownHint";
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
            {/* where the song-signup donkey lands: right side, just above this line */}
            <div
              data-donkey-anchor
              aria-hidden
              className="absolute bottom-full right-1 h-0 w-[30px] sm:right-2"
            />
            <p
              lang="he"
              dir="rtl"
              className="w-full text-center font-hebrew text-pretty text-[18px] font-medium leading-snug text-cream/90"
            >
              {EXPERIENCES_SECTION_OFFERINGS_HE}
            </p>
          </div>
        </div>

        <div className="mt-3 hidden shrink-0 lg:mt-auto lg:block">
          <div className="relative pb-3 text-center">
            <p
              lang="he"
              dir="rtl"
              className="mx-auto max-w-3xl font-hebrew text-pretty text-[30px] font-medium leading-snug text-cream"
            >
              {EXPERIENCES_SECTION_SUBTITLE_HE}
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
            </div>
          </div>
          <div className="h-2.5 w-full bg-[#FBEEE3]" aria-hidden />
        </div>
      </div>
    </section>
  );
}
