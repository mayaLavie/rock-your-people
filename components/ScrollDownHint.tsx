"use client";

import { useEffect, useState } from "react";

const SCROLL_CUE_CSS = `
.scroll-cue{position:relative;display:block;width:30px;height:56px;color:#f4e8d4}
.scroll-cue svg{position:absolute;left:0;display:block;animation:scroll-cue-fall 2.1s linear infinite}
.scroll-cue svg:nth-child(1){top:0}
.scroll-cue svg:nth-child(2){top:18px;animation-delay:.28s}
.scroll-cue svg:nth-child(3){top:36px;animation-delay:.56s}
.scroll-cue path{stroke:currentColor}
@keyframes scroll-cue-fall{
  0%{opacity:0;transform:translateY(-8px)}
  40%{opacity:1}
  100%{opacity:0;transform:translateY(10px)}
}
@media (prefers-reduced-motion:reduce){
  .scroll-cue svg{animation:none;opacity:1;transform:none}
}
`;

function Chevron() {
  return (
    <svg
      width="30"
      height="16"
      viewBox="0 0 30 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3 L15 13 L27 3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Falling-chevrons scroll cue, placed above the hero offerings line. */
export function ScrollDownHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToContent() {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{SCROLL_CUE_CSS}</style>
      <button
        type="button"
        onClick={scrollToContent}
        aria-label="גללו למטה לתוכן נוסף"
        tabIndex={visible ? 0 : -1}
        className={`border-0 bg-transparent p-0 transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="scroll-cue drop-shadow-[0_2px_8px_rgba(0,0,0,.55)]">
          <Chevron />
          <Chevron />
          <Chevron />
        </span>
      </button>
    </>
  );
}
