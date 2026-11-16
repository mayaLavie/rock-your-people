/*
 * Builds the static share images in public/og (1200x630 JPG, <=300KB):
 * og-default.jpg and lp-<slug>.jpg. Real event photo + dark gradient + Hebrew headline + logo.
 * Rendered with headless Chrome so Hebrew/RTL is shaped by the browser, not hand-reordered.
 *
 *   node scripts/og/build.mjs [outDir]      (default: public/og)
 */
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(process.argv[2] ?? join(ROOT, "public/og"));
const FONTS = join(ROOT, "components/landing/og-fonts");
const IMG = join(ROOT, "public/images");
const url = (p) => pathToFileURL(p).href;

// Copy comes from lib/product-details.ts / lib/constants.ts (no new claims).
const CARDS = [
  {
    file: "og-default.jpg",
    photo: join(IMG, "GALLERY_IMAGES/longShotCroud.jpeg"),
    position: "50% 55%",
    title: "הופכים אירוע חברה לחוויה שהצוות זוכר",
    latin: false,
    h1: 76,
    sub: "מופעים וסדנאות מוזיקה לחברות ולאירועים",
    cta: "ספרו לנו על האירוע",
  },
  {
    file: "lp-on-stage.jpg",
    cta: "בואו נתאים מופע לאירוע שלכם",
    photo: join(IMG, "evyatar stage.jpeg"),
    position: "40% 50%",
    title: "אתם על הבמה",
    latin: false,
    sub: "האנשים שלכם שרים ומנגנים איתנו, והם הכוכבים של הערב",
  },
  {
    file: "lp-band-in-a-day.jpg",
    cta: "בואו נתאים סדנה לצוות שלכם",
    photo: join(IMG, "rock-your-people-in-office.jpeg"),
    position: "50% 62%",
    title: "Band in a Day",
    latin: true,
    sub: "סדנת גיבוש מוזיקלית: הצוות שלכם הופך ללהקה ביום אחד",
  },
  {
    file: "lp-trio-360.jpg",
    cta: "בואו נתאים טריו לאירוע שלכם",
    photo: join(IMG, "GALLERY_IMAGES/appluse.jpeg"),
    position: "100% 60%",
    size: "165%",
    title: "Trio 360",
    latin: true,
    sub: "מופע טריו חי במעגל, שמביא את המוזיקה קרוב לקהל",
  },
  {
    file: "lp-rock-your-dj.jpg",
    cta: "בואו נתאים מסיבה לאירוע שלכם",
    photo: join(IMG, "GALLERY_IMAGES/mayaOnKit.jpeg"),
    position: "50% 12%",
    filter: "brightness(1.9) saturate(1.15)",
    title: "Rock Your DJ",
    latin: true,
    sub: "הרחבה רוקדת, המוזיקה חיה",
  },
];

const html = (c, cta) => `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:Rubik;font-weight:700;src:url("${url(join(FONTS, "rubik-hebrew-700.ttf"))}");unicode-range:U+0590-05FF,U+200C-2010,U+20AA;}
@font-face{font-family:Rubik;font-weight:700;src:url("${url(join(FONTS, "rubik-latin-700.ttf"))}");unicode-range:U+0000-00FF,U+2013-2026;}
@font-face{font-family:Bowlby;src:url("${url(join(FONTS, "bowlby-one-sc-latin-400.ttf"))}");}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#1e1c1c;font-family:Rubik,sans-serif;color:#fff}
.photo{position:absolute;inset:0;${c.filter ? `filter:${c.filter};` : ""}background:url("${url(c.photo)}") ${c.position}/${c.size ?? "cover"} no-repeat}
.shade{position:absolute;inset:0;background:
 linear-gradient(270deg,rgba(14,12,12,.92) 0%,rgba(14,12,12,.84) 46%,rgba(14,12,12,.25) 78%,rgba(14,12,12,.05) 100%),
 linear-gradient(0deg,rgba(14,12,12,.55) 0%,rgba(14,12,12,0) 40%)}
.frame{position:absolute;inset:0;border:12px solid #ff2d73}
.col{position:absolute;top:0;bottom:0;right:0;width:760px;padding:48px 64px 48px 40px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:right}
.logo{height:96px;width:auto;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))}
h1{font-weight:700;font-size:${c.h1 ?? (c.latin ? 96 : 104)}px;line-height:1.05;text-wrap:balance;${c.latin ? "font-family:Bowlby,Rubik;font-weight:400;text-transform:uppercase;letter-spacing:1px;" : ""}text-shadow:0 3px 14px rgba(0,0,0,.5)}
.sub{margin-top:18px;text-wrap:balance;font-size:42px;line-height:1.25;font-weight:700;color:#fbeee3;text-shadow:0 2px 10px rgba(0,0,0,.55)}
.cta{align-self:flex-start;background:#ffe34d;color:#1e1c1c;font-weight:700;font-size:34px;padding:12px 30px;border-radius:8px}
</style></head><body>
<div class="photo"></div><div class="shade"></div><div class="frame"></div>
<div class="col">
  <img class="logo" src="${url(join(IMG, "rock-your-people-title-transparent.png"))}" alt="">
  <div><h1>${c.title}</h1><p class="sub">${c.sub}</p></div>
  <div class="cta">${cta}</div>
</div></body></html>`;

mkdirSync(OUT, { recursive: true });
const executablePath = ["/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of CARDS) {
  const tmp = join(OUT, `.${card.file}.html`);
  const { writeFileSync, rmSync } = await import("node:fs");
  writeFileSync(tmp, html(card, card.cta));
  await page.goto(url(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  let q = 82;
  for (;;) {
    await page.screenshot({ path: join(OUT, card.file), type: "jpeg", quality: q });
    const kb = statSync(join(OUT, card.file)).size / 1024;
    if (kb <= 280 || q <= 50) { console.log(card.file, `${kb.toFixed(0)}KB q${q}`); break; }
    q -= 6;
  }
  rmSync(tmp);
}
await browser.close();
