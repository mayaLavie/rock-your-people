import type { ReactNode } from "react";

/** Background video for the top of the landing page (hero + products + social proof). */
export const TOP_SECTION_VIDEO_SRC = "/images/video%20land%20page.mp4";

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
        <video
          className="top-section-video absolute inset-0 h-full w-full"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={TOP_SECTION_VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-magenta/70" />
        <div className="absolute inset-0 bg-[#1e1c1c]/30" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
