import type { ReactNode } from "react";
import { HeroVideo } from "@/components/HeroVideo";

/** Background video for the top of the landing page (hero + products + social proof). */
export const TOP_SECTION_VIDEO_SRC = "/images/video%20land%20page.mp4";

/** Light frame of the video (about 7 KB) that paints before the MP4 arrives. */
export const TOP_SECTION_VIDEO_POSTER = "/images/video-land-page-poster.webp";

type TopSectionShellProps = {
  children: ReactNode;
};

export function TopSectionShell({ children }: TopSectionShellProps) {
  return (
    <div className="top-section-shell relative isolate overflow-hidden bg-magenta">
      {/* First screen only — tall page height was over-cropping with object-cover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-dvh overflow-hidden"
        aria-hidden
      >
        <HeroVideo
          className="top-section-video absolute inset-0 h-full w-full"
          src={TOP_SECTION_VIDEO_SRC}
          poster={TOP_SECTION_VIDEO_POSTER}
        />
        <div className="absolute inset-0 bg-magenta/70" />
        <div className="absolute inset-0 bg-[#1e1c1c]/40 lg:bg-[#1e1c1c]/30" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
