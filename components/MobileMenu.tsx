"use client";

import { MOBILE_MENU_LINKS } from "@/lib/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function readDetailsOpen(details: HTMLDetailsElement | null) {
  return details?.open ?? false;
}

export function MobileMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const syncOpenFromDetails = useCallback(() => {
    setOpen(readDetailsOpen(detailsRef.current));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    syncOpenFromDetails();

    const observer = new MutationObserver(syncOpenFromDetails);
    observer.observe(details, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, [mounted, syncOpenFromDetails]);

  const closeMenu = useCallback(() => {
    const details = detailsRef.current;
    if (details) {
      details.open = false;
      details.removeAttribute("open");
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  function navigateTo(href: string) {
    closeMenu();

    const id = href.replace(/^#/, "");
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }
    });
  }

  const menuOverlay =
    open && mounted ? (
      <>
        <button
          type="button"
          aria-label="סגירת תפריט"
          className="fixed inset-x-0 bottom-0 top-[var(--site-header-height)] z-[300] bg-black/40"
          onClick={closeMenu}
        />
        <nav
          id="mobile-menu-panel"
          className="fixed inset-x-0 top-[var(--site-header-height)] z-[301] max-h-[calc(100dvh-var(--site-header-height))] overflow-y-auto border-b-2 border-cream bg-[#c43e6d] px-4 py-4 shadow-lg"
          aria-label="ניווט מובייל"
        >
          <ul className="flex flex-col gap-1">
            {MOBILE_MENU_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-3 text-sm font-medium uppercase tracking-wider text-cream"
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo(link.href);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </>
    ) : null;

  return (
    <>
      <details ref={detailsRef} className="relative md:hidden">
        <summary
          className="relative z-[302] flex h-9 w-9 cursor-pointer list-none touch-manipulation items-center justify-center rounded-full border-0 bg-transparent text-lg leading-none text-cream transition hover:bg-cream/15 [&::-webkit-details-marker]:hidden"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-controls="mobile-menu-panel"
          aria-expanded={open}
          onClick={() => {
            queueMicrotask(syncOpenFromDetails);
          }}
        >
          {open ? "×" : "≡"}
        </summary>
      </details>
      {menuOverlay ? createPortal(menuOverlay, document.body) : null}
    </>
  );
}
