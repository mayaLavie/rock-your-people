import Image from "next/image";
import { TITLE_IMAGE } from "@/lib/constants";

/* Restore Hebrew tagline in hero — import HERO_TAGLINE_HE from @/lib/constants and uncomment <p> below */

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

        <div className="flex flex-1 items-end">
          <div className="w-full max-w-[180px] shrink-0 sm:max-w-[220px] md:max-w-[240px] lg:max-w-[200px]">
            <Image
              src={TITLE_IMAGE.src}
              alt={TITLE_IMAGE.alt}
              width={TITLE_IMAGE.width}
              height={TITLE_IMAGE.height}
              priority
              className="h-auto w-full"
            />
          </div>

          {/*
          <p
            lang="he"
            dir="rtl"
            className="min-w-0 max-w-[520px] shrink-0 self-end font-hebrew text-pretty text-right text-[21px] font-medium leading-snug break-words text-[#FBEEE3]"
          >
            {HERO_TAGLINE_HE}
          </p>
          — text now lives in SocialProof (#experience)
          */}
        </div>

        <div className="mt-3 h-2.5 w-full shrink-0 bg-[#FBEEE3]" aria-hidden />
      </div>
    </section>
  );
}
