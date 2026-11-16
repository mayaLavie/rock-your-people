import { test, expect } from "./fixtures";

const SLUGS = ["on-stage", "band-in-a-day", "trio-360", "rock-your-dj"] as const;

const TITLES: Record<(typeof SLUGS)[number], string> = {
  "on-stage": "אתם על הבמה: מופע חי שבו האנשים שלכם הם הכוכבים",
  "band-in-a-day": "Band in a Day: סדנת גיבוש מוזיקלית שהופכת צוות ללהקה",
  "trio-360": "Trio 360: מופע טריו חי לקבלות פנים ולאירועי חברה",
  "rock-your-dj": "Rock Your DJ: מסיבה עם די ג'יי ונגנים חיים על הרחבה",
};
const CTA_SENTENCE = "ספרו לנו על האירוע ונתאים לכם חוויה";
const MAX_OG_BYTES = 300 * 1024;

const words = (text: string) =>
  text
    .replace(/[.,:;!?"'׳״()\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

for (const slug of SLUGS) {
  test.describe(`landing /lp/${slug}`, () => {
    test("renders with product root, one h1, contact and meta", async ({ page }) => {
      const response = await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      expect(response?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(`main[data-product="${slug}"][data-page-type="landing"]`)).toHaveCount(1);
      await expect(page.locator("#contact")).toHaveCount(1);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/lp/${slug}$`),
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        "content",
        "he_IL",
      );
    });

    test("primary CTA scrolls to #contact", async ({ page }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      await page.locator("#lp-hero-cta").click();
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.2 });
    });

    test("title, og/twitter title and description are benefit-led", async ({ page }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      const full = `${TITLES[slug]} | Rock Your People`;
      await expect(page).toHaveTitle(full);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", full);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", full);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description).toMatch(new RegExp(`${CTA_SENTENCE}\\.?$`));
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        "content",
        description!,
      );
    });

    test("og image is a real 1200x630 jpg under 300KB", async ({ page, request }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(new URL(ogImage!).pathname).toBe(`/og/lp-${slug}.jpg`);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", ogImage!);
      const res = await request.get(new URL(ogImage!).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/jpeg");
      const body = await res.body();
      expect(body.length).toBeGreaterThan(20_000);
      expect(body.length).toBeLessThanOrEqual(MAX_OG_BYTES);
    });

    test("CTAs carry data-placement", async ({ page }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      await expect(page.locator('#lp-hero-cta[data-placement="lp-hero"]')).toHaveCount(1);
      await expect(page.locator('a[data-placement="lp-hero-whatsapp"]')).toHaveCount(1);
      await expect(
        page.getByTestId("landing-sticky-bar").locator('a[data-placement="lp-sticky"]'),
      ).toHaveCount(2);
    });

    test("trust line points to the reviews", async ({ page }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      const link = page.getByTestId("lp-trust-line").locator('a[href="#reviews"]');
      await expect(link).toHaveCount(1);
      await expect(page.locator("#reviews")).toHaveCount(1);
    });

    test("hero value line is not repeated in the next block", async ({ page }) => {
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      const hero = await page.locator("h1 + p").innerText();
      const next = await page.locator("#lp-experience-heading").locator("..").innerText();
      const heroWords = words(hero);
      const nextText = ` ${words(next).join(" ")} `;
      expect(heroWords.length).toBeGreaterThan(3);
      for (let i = 0; i + 4 <= heroWords.length; i++) {
        const gram = heroWords.slice(i, i + 4).join(" ");
        expect(nextText, `4-word run "${gram}" repeated below the hero`).not.toContain(` ${gram} `);
      }
    });
  });
}

test("band-in-a-day hero is a real people photo, not the instrument collage", async ({ page }) => {
  await page.goto("/lp/band-in-a-day", { waitUntil: "load" });
  const src = decodeURIComponent((await page.locator("section img").first().getAttribute("src")) ?? "");
  expect(src).toContain("rock-your-people-in-office");
  expect(src).not.toContain("band-in-a-day-collage");
});

test("home title and og:title are absolute (brand not doubled)", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const title = "Rock Your People | מופעים וסדנאות מוזיקה לחברות ולאירועים";
  await expect(page).toHaveTitle(title);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
});

test("default og image is a jpg under 300KB", async ({ request }) => {
  const res = await request.get("/og/og-default.jpg");
  expect(res.status()).toBe(200);
  expect((await res.body()).length).toBeLessThanOrEqual(MAX_OG_BYTES);
});

test("unknown slug returns 404", async ({ page }) => {
  const response = await page.goto("/lp/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("logo link preserves UTM query string", async ({ page }) => {
  await page.goto("/lp/on-stage?utm_source=x&utm_campaign=y", { waitUntil: "load" });
  const logo = page.getByRole("link", { name: /לעמוד הבית/ });
  await expect(logo).toHaveAttribute("href", "/?utm_source=x&utm_campaign=y");
});

test("sticky bar appears after hero, hides over the contact form (mobile only)", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "sticky bar is mobile-only");
  await page.goto("/lp/on-stage", { waitUntil: "load" });
  const bar = page.getByTestId("landing-sticky-bar");
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute("aria-hidden", "false");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute("aria-hidden", "true");
});

test("sticky bar hides while the consent bar is open and appears after accepting", async ({ page, isMobile }) => {
  test.skip(!isMobile, "sticky bar is mobile-only");
  await page.goto("/lp/on-stage", { waitUntil: "load" });
  const bar = page.getByTestId("landing-sticky-bar");
  const banner = page.getByTestId("cookie-banner");
  await expect(banner).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-consent-banner", "open");
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute("aria-hidden", "false");
  await expect(bar).toBeHidden();
  await page.getByRole("button", { name: "אישור", exact: true }).click();
  await expect(banner).toHaveCount(0);
  await expect(bar).toBeVisible();
});

test.describe("first visit on mobile: primary CTAs sit above the cookie bar", () => {
  const above = async (
    page: import("@playwright/test").Page,
    cta: import("@playwright/test").Locator,
  ) => {
    const banner = page.getByTestId("cookie-banner");
    await expect(banner).toBeVisible();
    await expect(cta).toBeVisible();
    const c = await cta.boundingBox();
    const b = await banner.boundingBox();
    expect(c && b).toBeTruthy();
    expect(c!.y).toBeGreaterThanOrEqual(0);
    expect(c!.y + c!.height).toBeLessThanOrEqual(b!.y + 0.5);
  };

  test("homepage hero CTA", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only layout check");
    await page.goto("/", { waitUntil: "load" });
    await above(page, page.locator('a[data-placement="hero"]').first());
  });

  for (const slug of SLUGS) {
    test(`/lp/${slug} primary CTA`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "mobile-only layout check");
      await page.goto(`/lp/${slug}`, { waitUntil: "load" });
      await above(page, page.locator("#lp-hero-cta"));
    });
  }
});
