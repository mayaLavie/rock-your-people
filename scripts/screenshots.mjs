#!/usr/bin/env node
/**
 * Usage: node scripts/screenshots.mjs <baseUrl> <outDir> [paths...] [--sections]
 *
 * For mobile (390x844 @2x) and desktop (1440x900) and every path (default "/"):
 *   <name>-<vp>-fold.png           above the fold, first-visit state (consent banner shown)
 *   <name>-<vp>-full.png           full page, banner shown
 *   <name>-<vp>-full-accepted.png  full page after clicking accept (banner gone)
 * With --sections (home page "/" only) also <outDir>/sections/<section>-<vp>.png
 * element shots (hero, products, details, reviews, faq, contact, footer, banner, popup).
 *
 * Network: *.facebook.com / *.facebook.net are fulfilled locally, nothing goes out.
 * Motion: CSS animations disabled in each shot, smooth scrolling off, every <video> paused on
 *   its first frame. NOTE: the site hides the hero video under prefers-reduced-motion, so
 *   reducedMotion is OFF by default (screenshots show what real users see). Pass
 *   --reduced-motion to emulate it.
 * Browser: PLAYWRIGHT_CHROMIUM_PATH, else /usr/bin/google-chrome|chromium, else Playwright's.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const withSections = args.includes("--sections");
const reducedMotion = args.includes("--reduced-motion") ? "reduce" : "no-preference";
const pos = args.filter((a) => !a.startsWith("--"));
const [baseUrl, outDir, ...pathsIn] = pos;
if (!baseUrl || !outDir) {
  console.error("usage: screenshots.mjs <baseUrl> <outDir> [paths...] [--sections]");
  process.exit(2);
}
const paths = pathsIn.length ? pathsIn : ["/"];

const VIEWPORTS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const ACCEPT = "מאשר/ת";
const FB = /^https?:\/\/([^/]+\.)?(facebook\.com|facebook\.net)\//i;

const executablePath = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => p && existsSync(p));

const SECTIONS = [
  ["hero", 'section[aria-labelledby="hero-heading"]'],
  ["products", "#products"],
  ["gallery", "#gallery"],
  ["engagement", "#engagement"],
  ["detail-your-people-on-stage", "#your-people-on-stage"],
  ["detail-leadership-workshop", "#leadership-workshop"],
  ["detail-trio-360", "#trio-360"],
  ["detail-beer-office", "#beer-office"],
  ["reviews", "#reviews"],
  ["social-proof", "#experience"],
  ["faq", "#faq"],
  ["contact", "#contact"],
  ["footer", "footer"],
];

const slug = (p) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/[^\w-]+/g, "-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function freezeVideos(page) {
  await page.evaluate(async () => {
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(
      vids.map((v) =>
        v.readyState >= 2 ? null : new Promise((r) => {
          v.addEventListener("loadeddata", r, { once: true });
          v.load();
          setTimeout(r, 8000);
        }),
      ),
    );
    for (const v of vids) {
      try {
        v.pause();
        if (v.currentTime !== 0) {
          const done = new Promise((r) => { v.addEventListener("seeked", r, { once: true }); setTimeout(r, 2000); });
          v.currentTime = 0;
          await done;
        }
      } catch {}
    }
  });
}

async function settle(page) {
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => document.fonts.ready);
  // trigger lazy images / observers by scrolling through the page, then return to top
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(
      imgs.map((i) =>
        i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }),
      ),
    );
  });
  await freezeVideos(page);
  await sleep(300);
  await page.evaluate(() => document.fonts.ready);
}

async function shoot(locator, file) {
  mkdirSync(path.dirname(file), { recursive: true });
  try {
    await locator.screenshot({ path: file, animations: "disabled" });
    console.log("saved", file);
  } catch (e) {
    console.log("skip ", file, "-", String(e.message).split("\n")[0]);
  }
}

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

for (const [vp, opts] of Object.entries(VIEWPORTS)) {
  for (const p of paths) {
    const name = slug(p);
    const ctx = await browser.newContext({ ...opts, reducedMotion, locale: "he-IL" });
    await ctx.route(FB, (route) =>
      route.fulfill({ status: 200, contentType: /\.js(\?|$)/.test(route.request().url()) ? "application/javascript" : "image/gif", body: "" }),
    );
    const page = await ctx.newPage();
    await page.goto(new URL(p, baseUrl).toString(), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(1500); // let the song-signup teaser and entrance effects land
    await freezeVideos(page);
    await sleep(200);

    const base = path.join(outDir, `${name}-${vp}`);
    mkdirSync(outDir, { recursive: true });

    // 1) above the fold, first-visit state (before settle() scrolls around)
    await page.screenshot({ path: `${base}-fold.png`, animations: "disabled" });
    console.log("saved", `${base}-fold.png`);

    const banner = page.locator('[aria-label="הודעה על עוגיות"]');
    const isHome = p === "/";

    if (withSections && isHome) {
      const sec = (n) => path.join(outDir, "sections", `${n}-${vp}.png`);
      if (await banner.count()) await shoot(banner, sec("cookie-banner"));
      const teaser = page.locator("button.ryp-teaser");
      if (await teaser.count()) {
        await shoot(teaser, sec("song-popup-teaser"));
        await teaser.click({ force: true }).catch(() => {});
        await sleep(800);
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.count()) {
          await page.screenshot({ path: sec("song-popup-open"), animations: "disabled" });
          console.log("saved", sec("song-popup-open"));
          await page.keyboard.press("Escape");
          const close = dialog.locator('[aria-label="סגירה"]').first();
          if (await close.count()) await close.click({ force: true }).catch(() => {});
          await sleep(500);
        }
      } else console.log("note: song popup teaser not present");
    }

    await settle(page);

    // 2) full page with banner
    if (!isHome || !withSections || (await banner.count())) {
      await page.screenshot({ path: `${base}-full.png`, fullPage: true, animations: "disabled" });
      console.log("saved", `${base}-full.png`);
    }

    // 3) accept consent -> full page without banner
    const accept = page.getByRole("button", { name: ACCEPT, exact: true });
    if (await accept.count()) await accept.click();
    await sleep(800);
    await settle(page);
    await page.screenshot({ path: `${base}-full-accepted.png`, fullPage: true, animations: "disabled" });
    console.log("saved", `${base}-full-accepted.png`);

    if (withSections && isHome) {
      for (const [n, sel] of SECTIONS) {
        const loc = page.locator(sel).first();
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded().catch(() => {});
          await sleep(250);
          await shoot(loc, path.join(outDir, "sections", `${n}-${vp}.png`));
        } else console.log("note: no element for", n);
      }
    }
    await ctx.close();
  }
}
await browser.close();
