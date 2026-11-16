import { createHash } from "node:crypto";
import type { APIRequestContext, BrowserContext, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const ACCEPT = "אישור";
const DECLINE = "דחייה";
const ORIGIN = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const PIXEL_ID = "1234567890123456";
const SHEET_URL = /script\.google\.com\/macros\//;

type CapiCall = {
  url: string;
  body: {
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

/** Form mode keeps the optional event details behind a disclosure. */
async function openDetails(page: Page) {
  const toggle = page.getByRole("button", { name: /הוסיפו פרטים על האירוע/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
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

  test("decline after accept stops everything in place: no reload, no more facebook requests, cookies cleared", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    expect((await context.cookies()).map((c) => c.name)).toContain("ryp_consent");
    let navigations = 0;
    page.on("framenavigated", () => navigations++);
    await page.evaluate(() => {
      (window as unknown as { __marker: number }).__marker = 1;
    });
    // Re-open the banner from the footer, then decline.
    await page.getByRole("button", { name: /Cookie settings|הגדרות עוגיות/ }).first().click();
    await page.getByRole("button", { name: DECLINE, exact: true }).click();
    await expect
      .poll(async () => (await context.cookies()).map((c) => c.name))
      .not.toContain("ryp_consent");
    meta.clear();
    seen.capi.length = 0;
    await page.locator("header a[href*='wa.me']:visible").first().click();
    await meta.expectNoRequests(1500);
    expect(seen.capi).toHaveLength(0);
    expect(navigations).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1);
    expect(await page.evaluate(() => typeof (window as unknown as { fbq?: unknown }).fbq)).toBe("undefined");
    expect(await page.locator('script[src*="connect.facebook.net"]').count()).toBe(0);
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).not.toContain("_fbp");
    expect(names).not.toContain("_fbc");
    // Accepting again works without a reload and tracks again.
    await page.getByRole("button", { name: /Cookie settings|הגדרות עוגיות/ }).first().click();
    await accept(page);
    await meta.expectEventOnce("PageView");
    expect(navigations).toBe(0);
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
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).toContain("_fbp");
  });
});

test.describe("cookie banner", () => {
  test("is a compact bottom bar with equal 44px+ buttons, one short informed sentence, and links to /privacy", async ({
    page,
  }, info) => {
    await page.goto("/", { waitUntil: "load" });
    const banner = page.getByTestId("cookie-banner");
    await expect(banner).toBeVisible();
    const vp = page.viewportSize()!;
    const box = (await banner.boundingBox())!;
    expect(box.y + box.height).toBeGreaterThanOrEqual(vp.height - 1); // flush with the bottom edge
    if (info.project.name === "mobile") expect(box.height).toBeLessThanOrEqual(96);
    else expect(box.height).toBeLessThanOrEqual(110);
    const accept = (await page.getByRole("button", { name: ACCEPT, exact: true }).boundingBox())!;
    const decline = (await page.getByRole("button", { name: DECLINE, exact: true }).boundingBox())!;
    expect(accept.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(accept.width - decline.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(accept.height - decline.height)).toBeLessThanOrEqual(1);
    await expect(banner).toContainText("Meta");
    await expect(banner).toContainText("מחוץ לישראל");
    await expect(banner.getByRole("link", { name: "פרטים" })).toHaveAttribute("href", "/privacy");
    // same colours: no visual nudge toward accepting
    const styles = await page.evaluate(() => {
      const [a, d] = Array.from(document.querySelectorAll('[data-testid="cookie-banner"] button')).map(
        (b) => {
          const cs = getComputedStyle(b);
          return [cs.backgroundColor, cs.color, cs.fontSize, cs.fontWeight].join("|");
        },
      );
      return { a, d };
    });
    expect(styles.a).toBe(styles.d);
  });

  test("does not cover the top of the page, and the landing sticky bar waits for a choice (mobile)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "mobile", "sticky bar is mobile-only");
    await page.goto("/lp/on-stage", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("data-consent-banner", "open");
    const banner = (await page.getByTestId("cookie-banner").boundingBox())!;
    expect(banner.y).toBeGreaterThan(page.viewportSize()!.height / 2);
    await page.locator("#reviews").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("landing-sticky-bar")).toBeHidden(); // visibility:hidden while the banner is open
    await accept(page);
    await expect(page.locator("html")).not.toHaveAttribute("data-consent-banner", /.+/);
    await expect(page.getByTestId("landing-sticky-bar")).toBeVisible();
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
    await page.locator('section[data-product="rock-your-dj"]').scrollIntoViewIfNeeded();
    const hit = await meta.expectEventOnce("ViewContent", { content_name: "rock-your-dj" });
    expect(hit.customData).toMatchObject({
      content_type: "product",
      content_category: "experience",
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.locator('section[data-product="rock-your-dj"]').scrollIntoViewIfNeeded();
    await meta.expectEventOnce("ViewContent", { content_name: "rock-your-dj" });
  });

  test("the four homepage detail sections carry their visible-name slug", async ({ page }) => {
    await page.goto("/");
    for (const slug of ["on-stage", "band-in-a-day", "rock-your-dj", "beer-office"]) {
      await expect(page.locator(`section[data-product="${slug}"]`)).toHaveCount(1);
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

  test("whatsapp mode: a filled form (name + message) is one Lead and never a Contact", async ({
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
    await page.locator("#contact-message").fill("אירוע חברה בדצמבר");
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

  test("whatsapp mode: an empty or name-only submit click is a Contact, not a Lead", async ({
    page,
    context,
    meta,
  }) => {
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact a[data-lead-submit]").click();
    const hit = await meta.expectEventOnce("Contact", { placement: "contact-form" });
    await meta.expectNoEvent("Lead");
    expect(hit.customData.content_name).toBe("general");
    await expect.poll(() => seen.whatsapp.length).toBeGreaterThan(0);
    meta.clear();
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact a[data-lead-submit]").click();
    await meta.expectEventOnce("Contact", { placement: "contact-form" });
    await meta.expectNoEvent("Lead");
  });

  test("the last #contact CTA placement is carried as cta_placement on the next Lead", async ({
    page,
    context,
    meta,
  }) => {
    await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "#contact";
      a.dataset.placement = "hero";
      a.id = "test-cta";
      a.textContent = "cta";
      a.style.cssText = "position:fixed;top:80px;left:10px;z-index:9999;background:#fff;padding:12px";
      document.body.appendChild(a);
    });
    await page.locator("#test-cta").click();
    await page.locator("#contact-name").fill("דנה");
    await page.locator("#contact-company").fill("חברה");
    await page.locator("#contact a[data-lead-submit]").click();
    const hit = await meta.expectEventOnce("Lead", { cta_placement: "hero" });
    expect(hit.customData.value).toBeUndefined(); // NEXT_PUBLIC_LEAD_VALUE is unset in the test build
    expect(hit.customData.currency).toBeUndefined();
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

test.describe("attribution precedence", () => {
  const fbcCookie = async (context: BrowserContext) =>
    (await context.cookies()).find((c) => c.name === "_fbc")?.value;
  const stored = (page: Page) =>
    page.evaluate(() => JSON.parse(window.sessionStorage.getItem("ryp-attribution") ?? "null"));

  test("a new, different fbclid refreshes _fbc; a utm-only landing keeps the fbclid", async ({
    page,
    context,
    meta,
  }) => {
    await watch(context);
    await page.goto("/?utm_source=fb&fbclid=AAA", { waitUntil: "load" });
    await accept(page);
    await meta.expectEventOnce("PageView");
    const first = await fbcCookie(context);
    expect(first).toMatch(/^fb\.1\.\d{13}\.AAA$/);

    await page.waitForTimeout(20);
    await page.goto("/?utm_source=fb2&fbclid=BBB", { waitUntil: "load" });
    await expect.poll(() => fbcCookie(context)).toMatch(/^fb\.1\.\d{13}\.BBB$/);
    const second = (await fbcCookie(context))!;
    expect(Number(second.split(".")[2])).toBeGreaterThan(Number(first!.split(".")[2]));
    // let this page's PageView (browser hit and server relay) finish before navigating away, so the
    // network report never sees a request cut off by the next navigation
    await expect.poll(() => meta.eventsNamed("PageView").length).toBe(2);
    await page.waitForTimeout(600);

    // utm-only landing: utm_* replaced (latest touch), fbclid and _fbc untouched
    await page.goto("/lp/on-stage?utm_source=newsletter&utm_campaign=c3", { waitUntil: "load" });
    await page.waitForTimeout(500);
    const kept = await stored(page);
    expect(kept.fbclid).toBe("BBB");
    expect(kept.utm).toEqual({ utm_source: "newsletter", utm_campaign: "c3" });
    expect(await fbcCookie(context)).toBe(second);
    await expect.poll(() => meta.eventsNamed("PageView").length).toBe(3);
    await page.waitForTimeout(600);

    // a landing with no parameters keeps everything
    await page.goto("/", { waitUntil: "load" });
    await expect.poll(() => meta.eventsNamed("PageView").length).toBe(4);
    await page.waitForTimeout(600);
    const again = await stored(page);
    expect(again.fbclid).toBe("BBB");
    expect(again.utm).toEqual({ utm_source: "newsletter", utm_campaign: "c3" });
  });
});

test.describe("conversions API route", () => {
  const endpoint = "/api/meta/event";
  const base = {
    event_name: "Lead",
    event_id: "11111111-2222-3333-4444-555555555555",
    event_source_url: "http://localhost:3201/?utm_source=fb",
    custom_data: { content_name: "general", lead_type: "form" },
  };
  const sameOrigin = { origin: ORIGIN };

  /** The Playwright request context keeps cookies, so this "accepts" for later calls. */
  async function grantConsent(request: APIRequestContext) {
    const res = await request.post("/api/consent", { headers: sameOrigin });
    expect(res.status()).toBe(200);
    expect(res.headers()["set-cookie"]).toMatch(/ryp_consent=granted\.\d+\.[\w-]+\.[\w-]+;.*HttpOnly.*SameSite=Lax/i);
  }

  test("without a token it answers a dry run with hashed user data only", async ({ request }) => {
    await grantConsent(request);
    const res = await request.post(endpoint, {
      headers: {
        ...sameOrigin,
        "x-vercel-forwarded-for": "203.0.113.7",
        "x-forwarded-for": "198.51.100.9, 10.0.0.1",
        "user-agent": "tracking-test",
      },
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
    // x-vercel-forwarded-for wins over the spoofable x-forwarded-for
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

  test("client IP falls back to x-real-ip, then to the right-most x-forwarded-for entry", async ({
    request,
  }) => {
    await grantConsent(request);
    const real = await request.post(endpoint, {
      headers: { ...sameOrigin, "x-real-ip": "203.0.113.20", "x-forwarded-for": "198.51.100.9" },
      data: base,
    });
    expect((await real.json()).payload.data[0].user_data.client_ip_address).toBe("203.0.113.20");
    const xff = await request.post(endpoint, {
      headers: { ...sameOrigin, "x-forwarded-for": "6.6.6.6, 203.0.113.30" },
      data: base,
    });
    expect((await xff.json()).payload.data[0].user_data.client_ip_address).toBe("203.0.113.30");
  });

  test("event_source_url keeps only utm_* (fbclid and other parameters are dropped)", async ({
    request,
  }) => {
    await grantConsent(request);
    const res = await request.post(endpoint, {
      headers: sameOrigin,
      data: {
        ...base,
        event_source_url:
          "http://localhost:3201/lp/on-stage?fbclid=ABC&utm_source=fb&email=a%40b.co&utm_campaign=spring#contact",
      },
    });
    expect(res.status()).toBe(202);
    const url = (await res.json()).payload.data[0].event_source_url as string;
    expect(url).toBe("http://localhost:3201/lp/on-stage?utm_source=fb&utm_campaign=spring");
  });

  test("rejects a missing, invalid or tampered consent cookie with 403", async ({
    request,
    playwright,
  }) => {
    // no cookie at all
    const none = await request.post(endpoint, { headers: sameOrigin, data: base });
    expect(none.status()).toBe(403);
    expect((await none.json()).error).toBe("consent_required");
    // the old client-side flag is not enough
    expect(
      (await request.post(endpoint, { headers: sameOrigin, data: { ...base, consent: true } })).status(),
    ).toBe(403);
    // forged and tampered values
    for (const value of [
      "granted.1700000000.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "granted",
      "yes",
    ]) {
      const res = await request.post(endpoint, {
        headers: { ...sameOrigin, cookie: `ryp_consent=${value}` },
        data: base,
      });
      expect(res.status()).toBe(403);
    }
    // a real value with a changed timestamp no longer verifies
    const granting = await request.post("/api/consent", { headers: sameOrigin });
    const real = /ryp_consent=([^;]+)/.exec(granting.headers()["set-cookie"] ?? "")![1];
    const [, ts, nonce, mac] = real.split(".");
    const forged = `granted.${Number(ts) + 1}.${nonce}.${mac}`;
    const fresh = await playwright.request.newContext({ baseURL: ORIGIN });
    const res = await fresh.post(endpoint, {
      headers: { ...sameOrigin, cookie: `ryp_consent=${forged}` },
      data: base,
    });
    expect(res.status()).toBe(403);
    const ok = await fresh.post(endpoint, {
      headers: { ...sameOrigin, cookie: `ryp_consent=${real}` },
      data: base,
    });
    expect(ok.status()).toBe(202);
    await fresh.dispose();
  });

  test("DELETE /api/consent clears the cookie, and events are refused again", async ({ request }) => {
    await grantConsent(request);
    expect((await request.post(endpoint, { headers: sameOrigin, data: base })).status()).toBe(202);
    const del = await request.delete("/api/consent", { headers: sameOrigin });
    expect(del.status()).toBe(200);
    expect(del.headers()["set-cookie"]).toMatch(/ryp_consent=;.*Max-Age=0/i);
    expect((await request.post(endpoint, { headers: sameOrigin, data: base })).status()).toBe(403);
  });

  test("rejects a foreign or missing Origin with 403 on every API route", async ({ request }) => {
    await grantConsent(request);
    const bad = { origin: "https://evil.example" };
    expect((await request.post(endpoint, { headers: bad, data: base })).status()).toBe(403);
    expect((await request.post(endpoint, { data: base })).status()).toBe(403);
    expect(
      (await request.post(endpoint, { headers: { referer: "https://evil.example/x" }, data: base })).status(),
    ).toBe(403);
    // a same-site Referer is an acceptable fallback when Origin is absent
    expect(
      (await request.post(endpoint, { headers: { referer: `${ORIGIN}/lp/on-stage` }, data: base })).status(),
    ).toBe(202);
    expect(
      (await request.post("/api/lead", { headers: bad, data: { name: "דנה", phone: "0501234567" } })).status(),
    ).toBe(403);
    expect((await request.post("/api/consent", { headers: bad })).status()).toBe(403);
  });

  test("rejects unknown events, bad ids and oversized bodies", async ({ request }) => {
    await grantConsent(request);
    const h = { headers: sameOrigin };
    expect((await request.post(endpoint, { ...h, data: { ...base, event_name: "Purchase" } })).status()).toBe(400);
    expect((await request.post(endpoint, { ...h, data: { ...base, event_id: "x" } })).status()).toBe(400);
    expect(
      (
        await request.post(endpoint, {
          headers: { ...sameOrigin, "content-type": "text/plain" },
          data: "not json",
        })
      ).status(),
    ).toBe(400);
    const big = { ...base, custom_data: { pad: "x".repeat(20_000) } };
    expect((await request.post(endpoint, { ...h, data: big })).status()).toBe(413);
  });

  test("events are limited per visitor (IP + consent id) at 60/min, not per IP", async ({
    playwright,
  }, info) => {
    // one address per project: mobile and desktop run in parallel against the same server
    const n = info.project.name === "mobile" ? 0 : 100;
    const headers = { ...sameOrigin, "x-vercel-forwarded-for": `198.51.100.${77 + n}` };
    const visitor = async () => {
      const ctx = await playwright.request.newContext({ baseURL: ORIGIN });
      const res = await ctx.post("/api/consent", { headers });
      expect(res.status()).toBe(200);
      return ctx;
    };
    const a = await visitor();
    const b = await visitor(); // a colleague behind the same office IP
    let limited = 0;
    let firstLimitedAt = 0;
    for (let i = 1; i <= 64; i++) {
      const res = await a.post(endpoint, { headers, data: base });
      if (res.status() === 429) {
        limited++;
        if (!firstLimitedAt) firstLimitedAt = i;
      }
    }
    expect(firstLimitedAt).toBe(61);
    expect(limited).toBe(4);
    // same IP, different consent cookie: not throttled as one visitor
    expect((await b.post(endpoint, { headers, data: base })).status()).toBe(202);
    // another IP is unaffected too
    const other = { ...sameOrigin, "x-vercel-forwarded-for": `198.51.100.${78 + n}` };
    expect((await a.post(endpoint, { headers: other, data: base })).status()).toBe(202);
    await a.dispose();
    await b.dispose();
  });

  test("GET /api/meta/health reports the state without exposing any secret", async ({ request }) => {
    const res = await request.get("/api/meta/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    // the test build has a pixel id, no access token, and a relaxed (dev fallback) consent secret
    expect(body.capi).toBe("dry-run");
    expect(body.reason).toContain("META_CAPI_ACCESS_TOKEN");
    // testMode appears because this build carries NEXT_PUBLIC_E2E (it must never be set in production)
    expect(Object.keys(body).sort()).toEqual(["capi", "reason", "testMode"]);
    expect(body.testMode).toBe(true);
    const text = JSON.stringify(body);
    expect(text).not.toContain("1234567890123456");
    expect(text).not.toContain("dev-only-insecure");
  });

  test("lead route validates, rate limits (5/min) and answers a dry run without a webhook", async ({
    request,
  }, info) => {
    const n = info.project.name === "mobile" ? 0 : 100;
    const h = { headers: { ...sameOrigin, "x-vercel-forwarded-for": `198.51.100.${90 + n}` } };
    const bad = await request.post("/api/lead", { ...h, data: { name: "דנה", phone: "123" } });
    expect(bad.status()).toBe(400);
    const ok = await request.post("/api/lead", {
      ...h,
      data: { name: "דנה", phone: "050-123-4567", product: "trio-360", utm: { utm_source: "fb" } },
    });
    expect(ok.status()).toBe(202);
    expect((await ok.json()).dryRun).toBe(true);
    let limited = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/lead", {
        ...h,
        data: { name: "דנה", phone: "050-123-4567" },
      });
      if (res.status() === 429) limited++;
    }
    expect(limited).toBeGreaterThanOrEqual(1);
    const big = await request.post("/api/lead", {
      headers: { ...sameOrigin, "x-vercel-forwarded-for": `198.51.100.${91 + n}` },
      data: { name: "דנה", phone: "0501234567", message: "x".repeat(20_000) },
    });
    expect(big.status()).toBe(413);
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

/**
 * Records every fbq(...) call in order, in the test process (so it survives the mobile navigation to
 * WhatsApp). Installed before any page script runs.
 */
async function recordFbq(context: BrowserContext): Promise<unknown[][]> {
  const calls: unknown[][] = [];
  await context.exposeFunction("__recordFbq", (args: unknown[]) => {
    calls.push(args);
  });
  await context.addInitScript(() => {
    const w = window as unknown as { __recordFbq: (a: unknown[]) => void };
    let current: unknown;
    Object.defineProperty(window, "fbq", {
      configurable: true,
      get: () => current,
      set(fn: ((...a: unknown[]) => void) & Record<string, unknown>) {
        const wrapped = function (...args: unknown[]) {
          try {
            w.__recordFbq(JSON.parse(JSON.stringify(args)));
          } catch {
            // ignore
          }
          return fn(...args);
        } as ((...a: unknown[]) => void) & Record<string, unknown>;
        Object.assign(wrapped, fn);
        wrapped.push = wrapped;
        current = wrapped;
      },
    });
  });
  return calls;
}

test.describe("lead mode: form", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => localStorage.setItem("ryp-e2e-lead-mode", "form"));
  });

  test("optional event fields reach /api/lead and the WhatsApp text, never Meta; advanced matching init precedes Lead", async ({
    page,
    context,
    meta,
  }) => {
    const calls = await recordFbq(context);
    const seen = await watch(context);
    await openAccepted(page);
    await meta.expectEventOnce("PageView");
    meta.clear();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator("#contact-name").fill("דנה כהן");
    await page.locator("#contact-phone").fill("050-123-4567");
    await openDetails(page);
    await page.locator("#contact-event-type").selectOption("יום גיבוש");
    await page.locator("#contact-headcount").fill("85");
    await page.locator("#contact-date").fill("14/02/2027");
    await page.locator("#contact button[type=submit]").click();

    const hit = await meta.expectEventOnce("Lead", { lead_type: "form" });
    await expect.poll(() => seen.lead.length).toBe(1);
    expect(seen.lead[0].body).toMatchObject({
      event_type: "יום גיבוש",
      headcount: "85",
      event_date: "2027-02-14",
    });
    await expect.poll(() => seen.whatsapp.length).toBeGreaterThan(0);
    const wa = decodeURIComponent(seen.whatsapp[0]);
    expect(wa).toContain("יום גיבוש");
    expect(wa).toContain("85");
    expect(wa).toContain("14/02/2027");

    // none of the optional fields is part of what Meta receives (pixel or Conversions API)
    const capi = JSON.stringify(seen.capi.filter((c) => c.body.event_name === "Lead"));
    for (const v of ["יום גיבוש", "2027-02-14", "14/02/2027", "event_type", "headcount", "event_date"]) {
      expect(capi).not.toContain(v);
      expect(JSON.stringify(hit)).not.toContain(encodeURIComponent(v));
    }
    expect(capi).not.toContain('"85"');

    // browser advanced matching: init with normalised ph/fn happens BEFORE the Lead track call
    const initIdx = calls.findIndex(
      (c) => c[0] === "init" && typeof c[2] === "object" && c[2] !== null,
    );
    const leadIdx = calls.findIndex((c) => c[0] === "track" && c[1] === "Lead");
    expect(initIdx, JSON.stringify(calls)).toBeGreaterThan(-1);
    expect(leadIdx).toBeGreaterThan(initIdx);
    expect(calls[initIdx][1]).toBe(PIXEL_ID);
    expect(calls[initIdx][2]).toEqual({ ph: "972501234567", fn: "דנה" });
    expect((calls[leadIdx][3] as { eventID: string }).eventID).toBe(hit.eventID);
    // the track call itself carries no personal data
    expect(JSON.stringify(calls[leadIdx])).not.toContain("972501234567");
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
    await openDetails(page);
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
    // The Lead hit itself never carries the phone or the name (advanced matching is a separate init).
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
