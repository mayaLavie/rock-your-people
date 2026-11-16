import { test, expect } from "./fixtures";

/** data-product must follow the product name the visitor SEES (legacy DOM ids are misleading). */
const DETAIL_SECTIONS = [
  { id: "your-people-on-stage", visibleName: "אתם על הבמה", slug: "on-stage" },
  { id: "leadership-workshop", visibleName: "Band in a Day", slug: "band-in-a-day" },
  // the legacy id `trio-360` renders the Rock Your DJ copy
  { id: "trio-360", visibleName: "Rock Your DJ", slug: "rock-your-dj" },
  { id: "beer-office", visibleName: "בירה ונרימה", slug: "beer-office" },
] as const;

test.describe("visible product name -> data-product slug", () => {
  for (const s of DETAIL_SECTIONS) {
    test(`homepage #${s.id} shows "${s.visibleName}" and is ${s.slug}`, async ({ page }) => {
      await page.goto("/");
      const section = page.locator(`section#${s.id}`);
      await expect(section).toHaveAttribute("data-product", s.slug);
      await expect(section.locator("h2, h3").first()).toContainText(s.visibleName);
      await expect(section).toContainText(`דברו איתנו על ${s.visibleName === "אתם על הבמה" ? "מופע אתם על הבמה" : s.visibleName}`);
    });
  }

  test("homepage carries each homepage slug exactly once on a section, none for trio-360", async ({ page }) => {
    await page.goto("/");
    for (const s of DETAIL_SECTIONS) {
      await expect(page.locator(`section[data-product="${s.slug}"]`)).toHaveCount(1);
    }
    await expect(page.locator('[data-product="trio-360"]')).toHaveCount(0);
  });

  test("product cards carry the slug of the name printed on them", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('button[data-product-kind="card"]');
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(3);
    const names: Record<string, string> = {
      "rock-your-dj": "Rock Your DJ",
      "on-stage": "אתם על הבמה",
      "band-in-a-day": "Band in a Day",
    };
    for (let i = 0; i < n; i++) {
      const card = cards.nth(i);
      const slug = (await card.getAttribute("data-product"))!;
      if (!names[slug]) continue; // office card (no detail section)
      await expect(card).toContainText(names[slug]!);
    }
    // every named product has a card
    for (const slug of Object.keys(names)) {
      await expect(page.locator(`button[data-product-kind="card"][data-product="${slug}"]`)).toHaveCount(1);
    }
  });

  test("/lp/rock-your-dj: root is rock-your-dj, the beer block is beer-office", async ({ page }) => {
    await page.goto("/lp/rock-your-dj");
    await expect(page.locator('main[data-product="rock-your-dj"]')).toHaveCount(1);
    const beer = page.locator('div[data-product="beer-office"]');
    await expect(beer).toHaveCount(1);
    await expect(beer).toContainText("בירה ונרימה");
  });
});

test.describe("contact hint per lead mode", () => {
  test("whatsapp mode keeps its hint", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact")).toContainText("גם אם השדות ריקים");
  });

  test("form mode does not claim empty fields work", async ({ page, context }) => {
    await context.addInitScript(() => localStorage.setItem("ryp-e2e-lead-mode", "form"));
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact).toContainText("מלאו שם וטלפון");
    await expect(contact).not.toContainText("גם אם השדות ריקים");
  });
});

test.describe("contact section", () => {
  test("Hebrew heading, rtl on the homepage and on landing pages", async ({ page }) => {
    for (const path of ["/", "/lp/on-stage"]) {
      await page.goto(path);
      const section = page.locator("section#contact");
      await expect(section).toHaveAttribute("dir", "rtl");
      await expect(section.locator("h2")).toHaveText("מוכנים לגרום לאנשים שלכם לרקוד?");
      await expect(section).not.toContainText("READY TO ROCK");
      await expect(section).toContainText("ההודעה תיפתח בוואטסאפ");
    }
  });

  test("form mode: notice with privacy link, optional fields, solid submit button in the error state", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => localStorage.setItem("ryp-e2e-lead-mode", "form"));
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact).toContainText("הפרטים יישלחו אל Rock Your People");
    await expect(contact.getByRole("link", { name: "מדיניות הפרטיות" })).toHaveAttribute("href", "/privacy");
    await contact.getByRole("button", { name: /הוסיפו פרטים על האירוע/ }).click();
    for (const id of ["#contact-event-type", "#contact-headcount", "#contact-date"]) {
      await expect(contact.locator(id)).toBeVisible();
      await expect(contact.locator(id)).not.toHaveAttribute("required", "");
    }
    const submit = contact.locator("button[type=submit]");
    await submit.click();
    await expect(page.locator("#contact-name-error")).toBeVisible();
    const colors = await submit.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(colors.bg).not.toBe("rgba(0, 0, 0, 0)");
    const errorColor = await page.locator("#contact-name-error").evaluate((el) => getComputedStyle(el).color);
    expect(errorColor).toBe("rgb(255, 180, 180)");
  });
});

test.describe("privacy policy", () => {
  test("matches the code: Meta CAPI, hashing, lead webhook, retention, rights, date", async ({ page }) => {
    await page.goto("/privacy");
    const main = page.locator("main");
    await expect(main).toContainText("16 בנובמבר 2026");
    for (const phrase of [
      "Conversions",
      "SHA-256",
      "פסאודונימיזציה",
      "Google Sheets",
      "ryp_consent",
      "sessionStorage",
      "24 חודשים",
      "מחוץ לישראל",
      "אינה חובה",
      "CompleteRegistration",
      "שירות ניהול פניות חיצוני",
    ]) {
      await expect(main).toContainText(phrase);
    }
    await expect(main).not.toContainText("אינם נשמרים באתר.");
    await expect(main).not.toContainText("[למילוי");
  });

  test("uses the shared legal header (logo + nav) like /accessibility", async ({ page }) => {
    await page.goto("/privacy");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /חזרה לעמוד הבית/ })).toHaveAttribute("href", "/");
    await expect(header.getByRole("link", { name: "צור קשר" })).toHaveAttribute("href", "/#contact");
  });
});

test.describe("round 3 integration", () => {
  const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

  test("song teaser sits clear of the h1, the hero CTAs and the header (no empty band, no overlap)", async ({ page }, info) => {
    await page.goto("/", { waitUntil: "load" });
    await page.locator("button.ryp-teaser").waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(1600); // drop animation
    const wrap = (await page.locator(".ryp-teaser-wrap").boundingBox())!;
    const vp = page.viewportSize()!;
    expect(wrap.x).toBeGreaterThanOrEqual(0);
    expect(wrap.x + wrap.width).toBeLessThanOrEqual(vp.width);
    const h1 = (await page.locator("h1").boundingBox())!;
    expect(overlaps(wrap, h1)).toBe(false);
    for (const placement of ["hero-primary", "hero-secondary"]) {
      const el = page.locator(`[data-placement="${placement}"]`).first();
      if (await el.count()) expect(overlaps(wrap, (await el.boundingBox())!)).toBe(false);
    }
    if (info.project.name === "mobile") {
      // the mobile hero has no invisible logo marker band any more
      await expect(page.locator("section[aria-labelledby=hero-heading] [data-hero-logo]")).toHaveCount(0);
      expect(h1.y).toBeLessThan(140); // headline starts right under the header
    }
  });

  test("Organization JSON-LD logo is a real PNG that resolves", async ({ page, request }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const logo = JSON.parse(raw!).logo as string;
    expect(logo).toMatch(/\.png$/);
    const res = await request.get(new URL(new URL(logo).pathname, page.url()).toString());
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("OG image alt matches the OG headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /הופכים אירוע חברה לחוויה שהצוות זוכר/);
  });

  for (const path of ["/", "/lp/on-stage", "/lp/band-in-a-day", "/lp/trio-360", "/lp/rock-your-dj"]) {
    test(`deferred cookie banner shows within 3s on ${path}, compact, with equal buttons and no tracking before a choice`, async ({
      page,
      context,
    }, info) => {
      const fb: string[] = [];
      const capi: string[] = [];
      context.on("request", (r) => {
        if (/facebook\.(com|net)/.test(r.url())) fb.push(r.url());
        if (r.url().includes("/api/meta/event")) capi.push(r.url());
      });
      await page.goto(path, { waitUntil: "commit" });
      const banner = page.getByTestId("cookie-banner");
      await expect(banner).toBeVisible({ timeout: 3000 });
      const box = (await banner.boundingBox())!;
      if (info.project.name === "mobile") expect(box.height).toBeLessThanOrEqual(96);
      const [a, d] = await banner.locator("button").all();
      const ab = (await a.boundingBox())!;
      const db = (await d.boundingBox())!;
      expect(Math.abs(ab.width - db.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(ab.height - db.height)).toBeLessThanOrEqual(1);
      await page.waitForTimeout(1500);
      expect(fb).toEqual([]);
      expect(capi).toEqual([]);
    });
  }
});
