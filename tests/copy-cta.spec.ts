import { test, expect } from "./fixtures";

const HERO_CTA = "בואו נתאים מופע לאירוע שלכם";

test.describe("hero CTA and copy", () => {
  test("hero CTA is visible in the first viewport and scrolls to #contact", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    const cta = page.getByRole("link", { name: HERO_CTA });
    await expect(cta).toBeVisible();

    const viewport = page.viewportSize()!;
    const box = (await cta.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.height).toBeGreaterThanOrEqual(44);

    // Open the page already past the cookie banner: dismissing it must not be required.
    await cta.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const el = document.getElementById("contact");
          return el ? Math.round(el.getBoundingClientRect().top) : null;
        }),
      )
      .toBeLessThan(viewport.height / 2);
  });

  test("accessibility statement page renders", async ({ page }) => {
    const response = await page.goto("/accessibility", { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("הצהרת נגישות");
  });

  test("footer links to the accessibility statement", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const link = page.locator("footer").getByRole("link", { name: "הצהרת נגישות" });
    await expect(link).toHaveAttribute("href", "/accessibility");
  });

  test("home page has no 'אינטרקטיב' typo", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const text = await page.evaluate(() => document.body.textContent ?? "");
    expect(text).not.toContain("אינטרקטיב");
  });
});
