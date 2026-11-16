import { test, expect } from "./fixtures";

const SLUGS = ["on-stage", "band-in-a-day", "trio-360", "rock-your-dj"] as const;

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

    test("og image is generated", async ({ request }) => {
      const res = await request.get(`/lp/${slug}/opengraph-image`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    });
  });
}

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
