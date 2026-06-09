"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { STORY_SECTION_PARAGRAPHS } from "@/lib/constants";

const STORY_IMAGE_SRC = "/images/land paqe.jpg";
const IMAGE_FADE_MS = 1400;
const TEXT_FADE_DELAY_MS = 500;

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageVisible, setImageVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          if (reducedMotion) {
            setImageVisible(true);
            setTextVisible(true);
          } else {
            setImageVisible(true);
            window.setTimeout(() => setTextVisible(true), TEXT_FADE_DELAY_MS);
          }

          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="flex min-h-dvh flex-col border-b-[3px] border-cream bg-magenta md:min-h-0"
      aria-labelledby="experience-heading"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={`relative flex min-h-0 w-full flex-1 items-center justify-center transition-opacity ease-in-out motion-reduce:transition-none md:flex-none ${
            imageVisible ? "opacity-100" : "opacity-0"
          } motion-reduce:opacity-100`}
          style={{ transitionDuration: `${IMAGE_FADE_MS}ms` }}
        >
          <Image
            src={encodeURI(STORY_IMAGE_SRC)}
            alt=""
            width={1200}
            height={1600}
            sizes="100vw"
            className="h-auto max-h-full w-full object-contain object-center md:max-h-none"
          />
        </div>

        <div
          className={`shrink-0 px-4 pb-5 pt-[10px] transition-opacity duration-700 ease-in-out motion-reduce:transition-none sm:px-6 sm:pb-6 lg:px-10 lg:pb-8 ${
            textVisible ? "opacity-100" : "opacity-0"
          } motion-reduce:opacity-100`}
        >
        <h2 id="experience-heading" className="sr-only">
          הסיפור שלנו
        </h2>
        <div
          lang="he"
          dir="rtl"
          className="mx-auto max-w-3xl space-y-4 font-hebrew text-pretty text-center text-[14px] font-medium leading-relaxed text-[#FBEEE3]"
        >
          {STORY_SECTION_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
