import Image from "next/image";
import type { ReactNode } from "react";
import { DesktopSiteHeader } from "@/components/DesktopSiteHeader";
import {
  EXPERIENCES_INTRO_PARAGRAPHS,
  TITLE_IMAGE,
} from "@/lib/constants";

type DesktopEditorialShellProps = {
  children: ReactNode;
};

export function DesktopEditorialShell({ children }: DesktopEditorialShellProps) {
  return (
    <div className="relative lg:min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-magenta via-[#ff2d73] to-[#d72866]" />
        <p className="font-display absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(3.5rem,12vw,11rem)] uppercase leading-none tracking-tight text-cream/[0.08]">
          ROCK YOUR PEOPLE
        </p>
        <div className="absolute -left-20 top-32 h-80 w-80 rounded-full bg-cream/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="absolute bottom-24 left-[18%] h-72 w-72 rounded-full bg-brand-purple/25 blur-3xl" />
        <div className="absolute right-[12%] top-[62%] h-64 w-64 rounded-full bg-cream/10 blur-2xl" />
      </div>

      <DesktopSiteHeader />

      <div className="lg:flex lg:items-start lg:justify-center lg:gap-10 lg:px-6 lg:pb-12 lg:pt-8 xl:gap-14 xl:px-10 2xl:gap-20">
        <aside className="hidden xl:sticky xl:top-[calc(var(--desktop-site-header-height)+2rem)] xl:flex xl:h-[calc(100dvh-var(--desktop-site-header-height)-2rem)] xl:w-[22rem] xl:shrink-0 xl:flex-col xl:items-center xl:justify-center xl:self-start xl:text-cream 2xl:w-[26rem]">
          <div className="w-full max-w-[21rem] 2xl:max-w-[25rem]">
            <Image
              src={TITLE_IMAGE.src}
              alt={TITLE_IMAGE.alt}
              width={TITLE_IMAGE.width}
              height={TITLE_IMAGE.height}
              priority
              className="h-auto w-full"
            />
          </div>
          <div
            lang="he"
            dir="rtl"
            className="mt-6 w-full space-y-3 text-center font-hebrew text-pretty text-[20px] font-bold leading-relaxed text-cream/90"
          >
            {EXPERIENCES_INTRO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
        </aside>

        <div className="desktop-editorial-frame w-full lg:max-w-[480px] lg:shrink-0 lg:overflow-x-hidden lg:rounded-[2px] lg:bg-background lg:shadow-[0_28px_90px_rgba(0,0,0,0.42)] lg:ring-1 lg:ring-cream/25">
          {children}
        </div>
      </div>
    </div>
  );
}
