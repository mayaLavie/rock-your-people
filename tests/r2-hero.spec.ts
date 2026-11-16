import { test, expect } from "./fixtures";

const HERO_CTA = "בואו נתאים מופע לאירוע שלכם";
const HEADLINE = "הופכים אירוע חברה לחוויה שהצוות זוכר";
const SLOGAN = "מחברים אנשים דרך מוזיקה";

test.describe("round 2: hero", () => {
  test("mobile fold: primary CTA bottom is within the first 600px", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await page.goto("/", { waitUntil: "load" });
    const box = (await page.getByRole("link", { name: HERO_CTA }).boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(600);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("exactly one h1, visible, with the new headline", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveText(HEADLINE);
    // the brand stays accessible through the logo
    await expect(page.getByRole("img", { name: "Rock Your People" }).first()).toBeAttached();
  });

  test("the brand slogan is visible exactly once in the hero area", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const visibleCount = await page.evaluate((text) => {
      const heroArea = document.body;
      return Array.from(heroArea.querySelectorAll<HTMLElement>("p, h1, h2, span, div"))
        .filter((el) => el.children.length === 0 && el.textContent?.trim() === text)
        .filter((el) => el.getBoundingClientRect().width > 0)
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }).length;
    }, SLOGAN);
    // first-screen occurrences only (the products section repeats it further down on mobile)
    expect(visibleCount).toBe(1);
  });

  test("hero CTA, microcopy and placements", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.getByText("ספרו לנו על האירוע ונחזור אליכם בוואטסאפ")).toBeVisible();
    await expect(page.locator('[data-placement="hero"]')).toHaveText(HERO_CTA);
    await expect(page.locator('[data-placement="hero-secondary"]')).toBeVisible();
    await expect(page.locator('[data-placement="carousel-end"]')).toHaveCount(1);
    await expect(page.locator('[data-placement="reviews-end"]')).toHaveCount(1);
    await expect(page.locator('[data-placement="faq-end"]')).toHaveCount(1);
    await expect(page.locator('[data-placement="carousel-end"]')).toHaveText(
      "בחרתם חוויה? ספרו לנו על האירוע",
    );
    await expect(page.locator('[data-placement="reviews-end"]')).toHaveText(
      "רוצים שגם האירוע שלכם יסתיים ככה? דברו איתנו",
    );
    await expect(page.locator('[data-placement="faq-end"]')).toHaveText(
      "נשארה שאלה? כתבו לנו בוואטסאפ",
    );
    await expect(page.locator('[data-placement="faq-end"]')).toHaveAttribute("href", /wa\.me\//);
  });

  test("hero video has a poster and attaches its source only after load", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const video = page.locator("video.top-section-video");
    await expect(video).toHaveAttribute("poster", /video-land-page-poster\.webp$/);
    await expect(video).toHaveAttribute("src", /video(%20|-)land(%20|-)page(-mobile)?\.mp4$/, { timeout: 10_000 });
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);
  });
});

test.describe("round 2: song-signup teaser", () => {
  test("not shown right after load; then shown, with a 44px close target clear of the CTA", async ({
    page,
  }, info) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await expect(page.locator(".ryp-teaser-wrap")).toHaveCount(0);

    const teaser = page.locator("button.ryp-teaser");
    await teaser.waitFor({ state: "visible", timeout: 20_000 });

    const close = page.locator("button.ryp-x");
    const closeBox = (await close.boundingBox())!;
    expect(closeBox.width).toBeGreaterThanOrEqual(44);
    expect(closeBox.height).toBeGreaterThanOrEqual(44);
    await expect(close).toHaveAttribute("aria-label", /^סגירת/);

    // let the drop animation settle before measuring
    await page.waitForTimeout(1500);
    const wrap = (await page.locator(".ryp-teaser-wrap").boundingBox())!;
    const cta = (await page.getByRole("link", { name: HERO_CTA }).boundingBox())!;
    const overlap =
      wrap.x < cta.x + cta.width &&
      wrap.x + wrap.width > cta.x &&
      wrap.y < cta.y + cta.height &&
      wrap.y + wrap.height > cta.y;
    if (info.project.name === "mobile") expect(overlap).toBe(false);

    await close.click({ force: true });
    await expect(page.locator(".ryp-teaser-wrap")).toHaveCount(0);
  });
});

test.describe("round 2: footer and accessibility page", () => {
  test("footer has Hebrew labels and tagline", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const footer = page.locator("footer");
    await expect(footer).toContainText("חוויות מוזיקליות אינטראקטיביות לחברות, צוותים ואירועים בלתי נשכחים");
    for (const label of ["צור קשר", "אינסטגרם", "וואטסאפ", "מדיניות פרטיות", "הצהרת נגישות"]) {
      await expect(footer.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(footer.getByRole("button", { name: "הגדרות עוגיות" })).toBeVisible();
    await expect(footer).not.toContainText("Privacy Policy");
    await expect(footer).not.toContainText("Cookie settings");
  });

  test("footer link targets are at least 44px tall", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const heights = await page
      .locator("footer a, footer button")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThanOrEqual(5);
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
  });

  test("/accessibility has no placeholders, a header, and the real contact details", async ({
    page,
  }) => {
    await page.goto("/accessibility", { waitUntil: "load" });
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toContain("[למילוי");
    expect(text).toContain("16 בנובמבר 2026");
    expect(text).toContain("052-463-2111");
    expect(text).toContain("אנחנו, להקת Rock Your People");
    expect(text).not.toContain("אימייל");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator('main a[href*="wa.me/972524632111"]')).toBeVisible();
    await expect(page.locator('main a[href*="instagram.com/rock.your.people"]')).toBeVisible();
  });

  test("/accessibility body text contrast is at least 4.5:1", async ({ page }) => {
    await page.goto("/accessibility", { waitUntil: "load" });
    const ratio = await page.evaluate(() => {
      // normalise any CSS colour syntax (rgb, oklab, color-mix...) through a 1px canvas
      const toRgba = (css: string) => {
        const c = document.createElement("canvas");
        c.width = c.height = 1;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
      };
      const lum = (rgb: number[]) => {
        const [r, g, b] = rgb.map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const p = document.querySelector("main p")!;
      const fg = toRgba(getComputedStyle(p).color);
      let bgEl: Element | null = p;
      let bg = [0, 0, 0, 0];
      while (bgEl && bg[3] === 0) {
        bg = toRgba(getComputedStyle(bgEl).backgroundColor);
        bgEl = bgEl.parentElement;
      }
      const a = lum(fg);
      const b = lum(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
