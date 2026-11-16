import type { ReactNode } from "react";
import { HeroVideo } from "@/components/HeroVideo";

/** Background video for the top of the landing page (hero + products + social proof). */
export const TOP_SECTION_VIDEO_SRC = "/images/video%20land%20page.mp4";

/** Light frame of the video (about 7 KB) that paints before the MP4 arrives. */
export const TOP_SECTION_VIDEO_POSTER = "/images/video-land-page-poster.webp";

/**
 * Tiny 24x43 blur of the poster (inline, ~0.5 KB). It holds the first paint so the real hero text,
 * not a 360x640 image, is the Largest Contentful Paint element; Chrome ignores such low-detail images.
 */
const TOP_SECTION_VIDEO_PLACEHOLDER =
  "data:image/webp;base64,UklGRmgBAABXRUJQVlA4IFwBAAAQBwCdASoYACsAPtFao0yoJSMiMBVaqQAaCUAYG7vJMGM1LUq8ZZ80Ggfq0hdq5YU5m8mawt+DWAa7lWtSw4O9oAD+6UyKQaeCKy2+DqvDLbIzMOFqZ50sY9er4KK2mvLGJGvwZ8H388gD/5j0pARp3Kw5DhxH2by9MSOGe0gYBk13jufBSaL4PIilM09B7yq9STYQpLYbZTDDfyCS/W6TmlteubS0aG+gDnt3G4llJ2G2kGWhmbYp25BpSAyu88UiZ8iQzFY5ddvyciZ+ConH4LXsvnVDLI0jMmPmnQXZ1qK8vFypcvyJhNsy7R1LO5EV0xmp5E7AqHUdMkplj9EokSACW/TqEm0eAiivXz8i+nbLjEAKNErjVIHECXXXrWlsa+ldmaeWvbRmkHrYY6LRgsa/1Zh9kFFXn+JSsnj5kOK24pfs5Am/uHm2+MS7QtkyrVhz4nTphwAAAAA=";

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
          placeholder={TOP_SECTION_VIDEO_PLACEHOLDER}
        />
        <div className="absolute inset-0 bg-magenta/70" />
        <div className="absolute inset-0 bg-[#1e1c1c]/40 lg:bg-[#1e1c1c]/30" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
