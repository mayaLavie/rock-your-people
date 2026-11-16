import { createHash } from "node:crypto";
import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const ACCEPT = "מאשר/ת";
const DECLINE = "לא מאשר/ת";
const PIXEL_ID = "1234567890123456";
const SHEET_URL = /script\.google\.com\/macros\//;

type CapiCall = {
  url: string;
  body: {
    consent?: boolean;
    event_name: string;
    event_id: string;
    event_source_url: string;
    custom_data: Record<string, string>;
    user_data: Record<string, string | undefined>;
  };
};

/** Records /api/meta/event and /api/lead calls, and neutralises WhatsApp navigations. */
async function watch(context: BrowserContext) {
  const capi: CapiCall[] = [];
  const lead: { body: Record<string, unknown> }[] = [];
  const whatsapp: string[] = [];

  context.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/meta/event")) {
      capi.push({ url, body: JSON.parse(req.postData() ?? "{}") });
    } else if (url.includes("/api/lead")) {
      lead.push({ body: JSON.parse(req.postData() ?? "{}") });
    }
  });
  // Nothing may reach WhatsApp; answer locally so mobile navigation does not break the page.
  await context.route(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//, (route) => {
    whatsapp.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/html", body: "<p>wa</p>" });
  });
  return { capi, lead, whatsapp };
}

async function accept(page: Page) {
  await page.getByRole("button", { name: ACCEPT, exact: true }).click();
}

async function openAccepted(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "load" });
  await accept(page);
}

test.describe("consent gate", () => {
  test("no facebook requests, no /api/meta calls, no cookies before consent", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await page.goto("/?utm_source=fb&fbclid=ABC", { waitUntil: "load" });
    await page.getByRole("button", { name: ACCEPT, exact: true }).waitFor();
    // Interactions before consent must not track either.
    await page.locator("header a[href*='wa.me']:visible").first().click();
    await meta.expectNoRequests(1500);
    expect(seen.capi).toHaveLength(0);
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).not.toContain("_fbp");
    expect(names).not.toContain("_fbc");
  });

  test("decline keeps everything off", async ({ page, context, meta }) => {
    const seen = await watch(context);
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: DECLINE, exact: true }).click();
    await page.locator("header a[href*='wa.me']:visible").first().click();
    await meta.expectNoRequests(1500);
    expect(seen.capi).toHaveLength(0);
  });

  test("accept fires PageView once with eventID and the configured pixel", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    const hit = await meta.expectEventOnce("PageView", { pixelId: PIXEL_ID });
    expect(hit.eventID).toMatch(/^[0-9a-f-]{36}$/);
    await expect.poll(() => seen.capi.filter((c) => c.body.event_name === "PageView").length).toBe(1);
    expect(seen.capi[0].body.event_id).toBe(hit.eventID);
    expect(seen.capi[0].body.consent).toBe(true);
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).toContain("_fbp");
  });
});

test.describe("events", () => {
  test("ViewContent once per product section, not repeated on re-scroll", async ({
    page,
    meta,
  }) => {
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator('[data-product="trio-360"]').scrollIntoViewIfNeeded();
    const hit = await meta.expectEventOnce("ViewContent", { content_name: "trio-360" });
    expect(hit.customData).toMatchObject({
      content_type: "product",
      content_category: "experience",
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.locator('[data-product="trio-360"]').scrollIntoViewIfNeeded();
    await meta.expectEventOnce("ViewContent", { content_name: "trio-360" });
  });

  test("all four product slugs exist on the home page", async ({ page }) => {
    await page.goto("/");
    for (const slug of ["on-stage", "band-in-a-day", "trio-360", "rock-your-dj"]) {
      await expect(page.locator(`[data-product="${slug}"]`)).toHaveCount(1);
    }
  });

  test("header WhatsApp click fires Contact once, with a matching /api/meta call", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("header a[href*='wa.me']:visible").first().click();
    const hit = await meta.expectEventOnce("Contact", {
      content_name: "general",
      placement: "header",
    });
    await meta.expectNoEvent("Lead");
    await expect
      .poll(() => seen.capi.filter((c) => c.body.event_name === "Contact").length)
      .toBe(1);
    const call = seen.capi.find((c) => c.body.event_name === "Contact")!;
    expect(call.body.event_id).toBe(hit.eventID);
    expect(call.body.custom_data).toMatchObject({ content_name: "general", placement: "header" });
  });

  test("footer WhatsApp click is a Contact with placement footer", async ({ page, context, meta }) => {
    await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("footer a[href*='wa.me']").first().click();
    await meta.expectEventOnce("Contact", { placement: "footer" });
  });

  test("whatsapp mode: form submit is one Lead and never a Contact", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact a[data-lead-submit]").click();
    const hit = await meta.expectEventOnce("Lead", {
      content_name: "general",
      lead_type: "whatsapp_click",
    });
    await meta.expectNoEvent("Contact");
    await expect.poll(() => seen.whatsapp.length).toBeGreaterThan(0);
    const calls = seen.capi.filter((c) => c.body.event_name === "Lead");
    expect(calls).toHaveLength(1);
    expect(calls[0].body.event_id).toBe(hit.eventID);
    expect(seen.lead).toHaveLength(0);
  });

  test("a secondary wa.me link inside the contact section is a Contact", async ({
    page,
    context,
    meta,
  }) => {
    await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact summary", { hasText: "לא נפתח" }).scrollIntoViewIfNeeded();
    await page.locator("#contact summary", { hasText: "לא נפתח" }).click();
    await page.locator("#contact details a[href*='wa.me']").first().click();
    await meta.expectEventOnce("Contact", { placement: "contact-form" });
    await meta.expectNoEvent("Lead");
  });
});

test.describe("attribution", () => {
  test("utm_* travel with events and fbclid becomes _fbc after consent", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await page.goto("/?utm_source=fb&utm_medium=paid&utm_campaign=test&fbclid=ABC", {
      waitUntil: "load",
    });
    await page.getByRole("button", { name: ACCEPT, exact: true }).waitFor();
    expect((await context.cookies()).map((c) => c.name)).not.toContain("_fbc");
    await accept(page);
    const hit = await meta.expectEventOnce("PageView");
    expect(hit.customData).toMatchObject({
      utm_source: "fb",
      utm_medium: "paid",
      utm_campaign: "test",
    });
    expect(hit.customData.fbclid).toBeUndefined();
    const fbc = (await context.cookies()).find((c) => c.name === "_fbc");
    expect(fbc?.value).toMatch(/^fb\.1\.\d{13}\.ABC$/);
    await expect.poll(() => seen.capi.length).toBeGreaterThan(0);
    expect(seen.capi[0].body.custom_data).toMatchObject({ utm_source: "fb", utm_campaign: "test" });
    expect(seen.capi[0].body.user_data.fbc).toBe(fbc?.value);

    // The tab keeps the campaign when the visitor moves on without parameters.
    meta.clear();
    await page.goto("/privacy", { waitUntil: "load" });
    const next = await meta.expectEventOnce("PageView");
    expect(next.customData).toMatchObject({ utm_source: "fb", utm_campaign: "test" });
  });
});

test.describe("conversions API route", () => {
  const endpoint = "/api/meta/event";
  const base = {
    consent: true,
    event_name: "Lead",
    event_id: "11111111-2222-3333-4444-555555555555",
    event_source_url: "http://localhost:3201/?utm_source=fb",
    custom_data: { content_name: "general", lead_type: "form" },
  };

  test("without a token it answers a dry run with hashed user data only", async ({ request }) => {
    const res = await request.post(endpoint, {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1", "user-agent": "tracking-test" },
      data: {
        ...base,
        user_data: { ph: "050-123-4567", fn: " דנה כהן ", fbp: "fb.1.1700000000000.1234567890" },
      },
    });
    expect(res.status()).toBe(202);
    const json = await res.json();
    expect(json.dryRun).toBe(true);
    const event = json.payload.data[0];
    expect(event).toMatchObject({
      event_name: "Lead",
      event_id: base.event_id,
      action_source: "website",
      event_source_url: base.event_source_url,
    });
    expect(event.user_data.client_ip_address).toBe("203.0.113.7");
    expect(event.user_data.client_user_agent).toBe("tracking-test");
    expect(event.user_data.fbp).toBe("fb.1.1700000000000.1234567890");
    const sha = (v: string) => createHash("sha256").update(v).digest("hex");
    expect(event.user_data.ph).toEqual([sha("972501234567")]);
    expect(event.user_data.fn).toEqual([sha("דנה")]);
    const text = JSON.stringify(json);
    expect(text).not.toContain("050-123-4567");
    expect(text).not.toContain("0501234567");
    expect(text).not.toContain("כהן");
  });

  test("rejects missing consent, unknown events and bad ids", async ({ request }) => {
    expect((await request.post(endpoint, { data: { ...base, consent: false } })).status()).toBe(403);
    expect((await request.post(endpoint, { data: { ...base, consent: undefined } })).status()).toBe(403);
    expect((await request.post(endpoint, { data: { ...base, event_name: "Purchase" } })).status()).toBe(400);
    expect((await request.post(endpoint, { data: { ...base, event_id: "x" } })).status()).toBe(400);
    expect(
      (await request.post(endpoint, { data: "not json", headers: { "content-type": "text/plain" } })).status(),
    ).toBe(400);
  });

  test("lead route validates and answers a dry run without a webhook", async ({ request }) => {
    const bad = await request.post("/api/lead", { data: { name: "דנה", phone: "123" } });
    expect(bad.status()).toBe(400);
    const ok = await request.post("/api/lead", {
      data: { name: "דנה", phone: "050-123-4567", product: "trio-360", utm: { utm_source: "fb" } },
    });
    expect(ok.status()).toBe(202);
    expect((await ok.json()).dryRun).toBe(true);
  });
});

test.describe("song signup", () => {
  test("successful submit fires CompleteRegistration once", async ({ page, context, meta }) => {
    await watch(context);
    let posts = 0;
    await context.route(SHEET_URL, (route) => {
      if (route.request().method() === "POST") posts++;
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    const teaser = page.locator("button.ryp-teaser");
    await teaser.waitFor({ state: "visible" });
    // The popup script can attach its handler a moment after the teaser shows (flaky under load):
    // retry the click until the song list is actually visible.
    const firstSong = page.locator(".ryp-song").first();
    await expect(async () => {
      if (!(await firstSong.isVisible())) await teaser.click({ force: true });
      await expect(firstSong).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 20_000 });
    await firstSong.click();
    await page.locator("#ryp-n0").fill("דנה כהן");
    await page.locator("#ryp-p0").fill("0501234567");
    await page.locator("button.ryp-cta").click();
    await meta.expectEventOnce("CompleteRegistration", { content_name: "song-signup" });
    expect(posts).toBeGreaterThan(0);
  });
});

test.describe("lead mode: form", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => localStorage.setItem("ryp-e2e-lead-mode", "form"));
  });

  test("shows Hebrew validation errors and sends nothing when invalid", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const submit = page.locator("#contact button[type=submit]");
    await submit.click();
    await expect(page.locator("#contact-name-error")).toHaveText("נא להזין שם");
    await expect(page.locator("#contact-phone-error")).toHaveText("נא להזין מספר טלפון");
    await expect(page.locator("#contact-phone")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("טלפון")).toBeVisible();

    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact-phone").fill("12345");
    await submit.click();
    await expect(page.locator("#contact-phone-error")).toContainText("אינו תקין");
    await expect(page.locator("#contact-name-error")).toHaveCount(0);

    await meta.expectNoEvent("Lead");
    expect(seen.lead).toHaveLength(0);
    expect(seen.whatsapp).toHaveLength(0);
  });

  test("valid submit posts /api/lead, fires one Lead (same event_id server-side), opens WhatsApp", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page, "/?utm_source=fb&utm_campaign=spring");
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact-name").fill("דנה כהן");
    await page.locator("#contact-phone").fill("+972 50-123-4567");
    await page.locator("#contact-company").fill("חברת דוגמה");
    await page.locator("#contact-message").fill("אירוע בדצמבר");
    await page.locator("#contact button[type=submit]").click();

    const hit = await meta.expectEventOnce("Lead", {
      content_name: "general",
      lead_type: "form",
    });
    await meta.expectNoEvent("Contact");
    await expect.poll(() => seen.lead.length).toBe(1);
    expect(seen.lead[0].body).toMatchObject({
      name: "דנה כהן",
      phone: "+972 50-123-4567",
      company: "חברת דוגמה",
      message: "אירוע בדצמבר",
      product: "general",
      utm: { utm_source: "fb", utm_campaign: "spring" },
      event_id: hit.eventID,
    });
    const calls = seen.capi.filter((c) => c.body.event_name === "Lead");
    expect(calls).toHaveLength(1);
    expect(calls[0].body.event_id).toBe(hit.eventID);
    expect(calls[0].body.user_data.ph).toBe("+972 50-123-4567");
    // The browser pixel never gets the phone or the name.
    expect(JSON.stringify(hit)).not.toContain("050");
    expect(JSON.stringify(hit)).not.toContain("דנה");
    await expect.poll(() => seen.whatsapp.length).toBeGreaterThan(0);
    expect(decodeURIComponent(seen.whatsapp[0])).toContain("דנה כהן");
  });

  test("WhatsApp still opens when the lead API fails", async ({ page, context, meta }) => {
    const seen = await watch(context);
    await context.route("**/api/lead", (route) => route.fulfill({ status: 500, body: "boom" }));
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact-phone").fill("0501234567");
    await page.locator("#contact button[type=submit]").click();
    await expect.poll(() => seen.whatsapp.length).toBeGreaterThan(0);
    await meta.expectEventOnce("Lead", { lead_type: "form" });
  });
});
