import { test, expect } from "./fixtures";

test.describe("round 3: speed", () => {
  test("favicon and touch icon are small raster files, no 44KB svg", async ({ page, request }) => {
    await page.goto("/lp/on-stage", { waitUntil: "load" });
    const hrefs = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]', (els) =>
      els.map((e) => (e as HTMLLinkElement).href),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.some((h) => h.endsWith("favicon.svg"))).toBe(false);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.ok()).toBe(true);
      expect((await res.body()).length).toBeLessThanOrEqual(3 * 1024);
    }
  });

  test("consent banner appears within 3s on /lp/on-stage and no pixel request was sent before choosing", async ({
    page,
  }) => {
    const hits: string[] = [];
    page.on("request", (r) => {
      if (/facebook\.(com|net)|\/api\/meta\/event/.test(r.url())) hits.push(r.url());
    });
    await page.goto("/lp/on-stage", { waitUntil: "commit" });
    await expect(page.getByTestId("cookie-banner")).toBeVisible({ timeout: 3000 });
    expect(hits).toEqual([]);
  });

  test("the consent banner is not part of the server-rendered HTML (mounted after idle)", async ({ request }) => {
    const html = await (await request.get("/lp/on-stage")).text();
    expect(html).not.toContain("data-testid=\"cookie-banner\"");
  });
});
