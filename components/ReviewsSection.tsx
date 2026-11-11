"use client";

import Image from "next/image";
import { useState } from "react";

const REVIEW_IMAGES = [
  { src: "/images/reviews/review-1.jpg", width: 1200, height: 467 },
  { src: "/images/reviews/review-2.jpg", width: 870, height: 1200 },
  { src: "/images/reviews/review-3.jpg", width: 1200, height: 1069 },
  { src: "/images/reviews/review-4.jpg", width: 1160, height: 1200 },
  { src: "/images/reviews/review-5.jpg", width: 554, height: 1200 },
  { src: "/images/reviews/review-6.jpg", width: 1200, height: 900 },
  { src: "/images/reviews/review-7.jpg", width: 1200, height: 829 },
  { src: "/images/reviews/review-8.jpg", width: 1200, height: 1182 },
] as const;

export function ReviewsSection() {
  const [paused, setPaused] = useState(false);
  const togglePaused = () => setPaused((value) => !value);

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-magenta px-4 pt-12 pb-14 sm:px-6 lg:px-4"
      aria-labelledby="reviews-heading"
    >
      <h2
        id="reviews-heading"
        lang="he"
        dir="rtl"
        className="text-center font-hebrew text-[32px] font-bold leading-none text-cream sm:text-[34px]"
      >
        ברוררררר שנהנתם
      </h2>
      <p
        lang="he"
        dir="rtl"
        className="mt-3 text-center font-hebrew text-[14px] font-semibold text-cream/90"
      >
        {paused ? "לחצו שוב כדי להמשיך" : "לחצו על המלצה כדי לעצור ולקרוא"}
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-pressed={paused}
        aria-label={paused ? "המשך תנועת ההמלצות" : "עצירת תנועת ההמלצות לקריאה"}
        onClick={togglePaused}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePaused();
          }
        }}
        className="reviews-marquee relative mx-auto mt-6 h-[70dvh] max-h-[640px] w-full max-w-[420px] cursor-pointer overflow-hidden outline-none"
      >
        <div
          className="reviews-marquee-track flex flex-col"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="m-0 flex list-none flex-col gap-6 p-0 pb-6"
              aria-hidden={copy === 1}
            >
              {REVIEW_IMAGES.map((image, index) => (
                <li key={`${copy}-${image.src}`}>
                  <div
                    className="block w-full overflow-hidden rounded-[5px] border-2 border-cream bg-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                  >
                    <Image
                      src={image.src}
                      alt={copy === 0 ? `המלצה ${index + 1}` : ""}
                      width={image.width}
                      height={image.height}
                      sizes="420px"
                      className="h-auto w-full"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
