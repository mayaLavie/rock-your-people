"use client";

import { useEffect } from "react";

const PRODUCT_DETAIL_HASHES = new Set([
  "#trio-360",
  "#your-people-on-stage",
  "#leadership-workshop",
]);

function getSiteHeaderHeight() {
  const root = document.documentElement;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const varName = isDesktop
    ? "--desktop-site-header-height"
    : "--site-header-height";
  const raw = getComputedStyle(root).getPropertyValue(varName).trim();
  if (!raw) return isDesktop ? 72 : 60;
  if (raw.endsWith("rem")) {
    return parseFloat(raw) * parseFloat(getComputedStyle(root).fontSize);
  }
  return parseFloat(raw);
}

function scrollToProductDetail(hash: string) {
  if (!PRODUCT_DETAIL_HASHES.has(hash)) return;

  const target = document.querySelector(hash);
  if (!target) return;

  const headerHeight = getSiteHeaderHeight();
  const top =
    target.getBoundingClientRect().top + window.scrollY - headerHeight;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function ProductDetailScrollAnchor() {
  useEffect(() => {
    function alignFromHash() {
      if (!window.location.hash) return;
      requestAnimationFrame(() => {
        scrollToProductDetail(window.location.hash);
      });
    }

    function handleClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !PRODUCT_DETAIL_HASHES.has(href)) return;

      event.preventDefault();
      window.history.pushState(null, "", href);
      scrollToProductDetail(href);
    }

    alignFromHash();
    window.addEventListener("hashchange", alignFromHash);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("hashchange", alignFromHash);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
