import Link from "next/link";
import type { ReactNode } from "react";
import { DesktopSiteHeader } from "@/components/DesktopSiteHeader";
import { EXPERIENCES_INTRO_PARAGRAPHS } from "@/lib/constants";

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
        <aside className="hidden xl:sticky xl:top-[calc(var(--desktop-site-header-height)+2rem)] xl:flex xl:max-h-[calc(100dvh-var(--desktop-site-header-height)-2rem)] xl:w-[17rem] xl:shrink-0 xl:flex-col xl:justify-center xl:self-start xl:text-cream 2xl:w-72">
          <h2 className="font-display text-4xl uppercase leading-none tracking-tight 2xl:text-[2.75rem]">
            Rock Your People
          </h2>
          <div
            lang="he"
            dir="rtl"
            className="mt-5 space-y-3 font-hebrew text-pretty text-base font-bold leading-relaxed text-cream/90 2xl:text-lg"
          >
            {EXPERIENCES_INTRO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
          <Link
            href="#contact"
            lang="he"
            className="mt-8 inline-flex w-fit border border-cream/90 px-6 py-2.5 font-hebrew text-sm font-medium text-cream transition hover:bg-cream hover:text-magenta"
          >
            דברו איתנו
          </Link>
        </aside>

        <div className="desktop-editorial-frame w-full lg:max-w-[480px] lg:shrink-0 lg:overflow-x-hidden lg:rounded-[2px] lg:bg-background lg:shadow-[0_28px_90px_rgba(0,0,0,0.42)] lg:ring-1 lg:ring-cream/25">
          {children}
        </div>
      </div>
    </div>
  );
}
