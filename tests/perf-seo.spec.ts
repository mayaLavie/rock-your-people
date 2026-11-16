import { test, expect } from "./fixtures";

test.describe("seo + head", () => {
  test("html lang, og, twitter, canonical", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    const content = (sel: string) => page.locator(sel).first().getAttribute("content");
    expect(await content('meta[property="og:title"]')).toBeTruthy();
    expect(await content('meta[property="og:locale"]')).toBe("he_IL");
    expect(await content('meta[name="twitter:card"]')).toBe("summary_large_image");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
    const ogImage = await content('meta[property="og:image"]');
    expect(ogImage).toBeTruthy();
    const res = await request.get(new URL(new URL(ogImage!).pathname, page.url()).toString());
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\//);
  });

  test("sitemap lists all pages", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const p of ["", "/privacy", "/accessibility", "/lp/on-stage", "/lp/band-in-a-day", "/lp/trio-360", "/lp/rock-your-dj"]) {
      expect(xml).toMatch(new RegExp(`<loc>https?://[^<]+${p}</loc>`));
    }
  });

  test("robots disallows api", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });

  test("json-ld parses", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw!);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data.name).toBe("Rock Your People");
    expect(data.sameAs).toContain("https://www.instagram.com/rock.your.people");
  });
});

test.describe("interactions after refactor", () => {
  test("mobile menu opens and closes", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: "מאשר/ת", exact: true }).click();
    await page.locator('summary[aria-label="פתיחת תפריט"]').click();
    await expect(page.getByRole("navigation", { name: "ניווט מובייל" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "ניווט מובייל" })).toBeHidden();
    await page.locator('summary[aria-label="פתיחת תפריט"]').click();
    await page.getByRole("button", { name: "סגירת תפריט" }).first().click({ force: true });
    await expect(page.getByRole("navigation", { name: "ניווט מובייל" })).toBeHidden();
  });

  test("carousel navigates", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: "מאשר/ת", exact: true }).click();
    const region = page.getByRole("region", { name: "Rock Your People experiences" });
    await region.scrollIntoViewIfNeeded();
    const cards = region.locator("button");
    const activeIndex = () => cards.evaluateAll((els) => els.findIndex((el) => el.getAttribute("aria-current") === "true"));
    const before = await activeIndex();
    await region.locator('button:not([aria-current="true"])').first().dispatchEvent("click");
    await expect.poll(activeIndex).not.toBe(before);
    const mid = await activeIndex();
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(activeIndex).not.toBe(mid);
  });
});
