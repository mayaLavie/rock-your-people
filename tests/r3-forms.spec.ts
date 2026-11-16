import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

const ACCEPT = "אישור";
const TOGGLE = /הוסיפו פרטים על האירוע/;

test.describe("contact form, form mode: optional details disclosure", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => localStorage.setItem("ryp-e2e-lead-mode", "form"));
    await context.route(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//, (r) =>
      r.fulfill({ status: 200, contentType: "text/html", body: "<p>wa</p>" }),
    );
  });

  test("collapsed by default: only name + phone + submit are visible", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact.locator("#contact-name")).toBeVisible();
    await expect(contact.locator("#contact-phone")).toBeVisible();
    const toggle = contact.getByRole("button", { name: TOGGLE });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    for (const id of ["#contact-company", "#contact-message", "#contact-event-type", "#contact-headcount", "#contact-date"]) {
      await expect(contact.locator(id)).toBeHidden();
    }
    await expect(contact.locator("button[type=submit]")).toBeVisible();
  });

  test("expands by keyboard, fields become reachable, aria-controls points at the panel", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("#contact").getByRole("button", { name: TOGGLE });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panelId = await toggle.getAttribute("aria-controls");
    await expect(page.locator(`#${panelId}`)).toBeVisible();
    await expect(page.locator("#contact-company")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#contact-date")).toBeHidden();
  });

  test("date: text field in dd/mm/yyyy, invalid value blocks submit and opens the panel, valid goes out as ISO", async ({
    page,
    context,
  }) => {
    const leads: Record<string, unknown>[] = [];
    context.on("request", (req) => {
      if (req.url().includes("/api/lead")) leads.push(JSON.parse(req.postData() ?? "{}"));
    });
    await page.goto("/");
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact-phone").fill("0501234567");
    await page.getByRole("button", { name: TOGGLE }).click();
    const date = page.locator("#contact-date");
    await expect(date).toHaveAttribute("type", "text");
    await expect(date).toHaveAttribute("inputmode", "numeric");
    await expect(date).toHaveAttribute("placeholder", "יום/חודש/שנה");
    await date.fill("31/02/2027");
    await page.getByRole("button", { name: TOGGLE }).click(); // collapse again
    await page.locator("#contact button[type=submit]").click();
    await expect(page.locator("#contact-date-error")).toBeVisible();
    await expect(page.locator("#contact-date")).toHaveAttribute("aria-invalid", "true");
    expect(leads).toHaveLength(0);
    await date.fill("14/02/2027");
    await page.locator("#contact button[type=submit]").click();
    await expect.poll(() => leads.length).toBe(1);
    expect(leads[0].event_date).toBe("2027-02-14");
    // empty date is fine (optional); mobile navigated to the WhatsApp stub, so start again
    await page.goto("/");
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact-phone").fill("0501234567");
    await page.locator("#contact button[type=submit]").click();
    await expect.poll(() => leads.length).toBe(2);
    expect(leads[1].event_date).toBe("");
  });

  test("placeholders on black clear 4.5:1", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    for (const id of ["#contact-name", "#contact-phone", "#contact-company", "#contact-date"]) {
      const ratio = await page.locator(id).evaluate((el) => {
        // let a canvas resolve any CSS colour syntax, composited over black
        const cv = document.createElement("canvas");
        cv.width = cv.height = 1;
        const ctx = cv.getContext("2d")!;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = getComputedStyle(el, "::placeholder").color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
        const lin = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        return (L + 0.05) / 0.05;
      });
      expect(ratio, id).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe("contact form, whatsapp mode: unchanged fields and Lead rule", () => {
  test("name, company and message stay visible with no disclosure", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact.getByRole("button", { name: TOGGLE })).toHaveCount(0);
    for (const id of ["#contact-name", "#contact-company", "#contact-message"]) {
      await expect(contact.locator(id)).toBeVisible();
    }
  });
});

async function openSongPopup(page: Page) {
  const teaser = page.locator("button.ryp-teaser");
  await teaser.waitFor({ state: "visible" });
  const firstSong = page.locator(".ryp-song").first();
  await expect(async () => {
    if (!(await firstSong.isVisible())) await teaser.click({ force: true });
    await expect(firstSong).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20_000 });
}

test.describe("song signup notice", () => {
  test("a notice under the submit says who, why, Google Sheets, and links to /privacy", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: ACCEPT, exact: true }).click();
    await openSongPopup(page);
    const notice = page.getByTestId("song-signup-notice");
    await expect(notice).toContainText("Rock Your People");
    await expect(notice).toContainText("לשריין לכם מקום על הבמה");
    await expect(notice).toContainText("גיליון גוגל");
    await expect(notice.getByRole("link", { name: "מדיניות הפרטיות" })).toHaveAttribute("href", "/privacy");
    // directly under the submit button
    const order = await page.evaluate(() => {
      const cta = document.querySelector("button.ryp-cta")!;
      const n = document.querySelector("[data-testid=song-signup-notice]")!;
      return cta.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
  });
});

test.describe("cookie banner names both purposes", () => {
  test("measurement and ad audiences, one choice, no toggles", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const banner = page.getByTestId("cookie-banner");
    await expect(banner).toContainText("לשתי מטרות, באישור אחד");
    await expect(banner).toContainText("מדידה, והצגת מודעות");
    await expect(banner.getByRole("checkbox")).toHaveCount(0);
    await expect(banner.getByRole("button")).toHaveCount(2);
  });
});

for (const path of ["/privacy", "/accessibility"]) {
  test(`${path}: table of contents anchors resolve to headings`, async ({ page }) => {
    await page.goto(path);
    const toc = page.getByRole("navigation", { name: "תוכן העניינים" });
    await expect(toc).toBeVisible();
    const hrefs = await toc.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThanOrEqual(4);
    for (const href of hrefs) {
      const id = href.slice(1);
      await expect(page.locator(`h2#${id}`), href).toHaveCount(1);
    }
    const last = hrefs[hrefs.length - 1];
    await toc.locator(`a[href="${last}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${last}$`));
  });
}
