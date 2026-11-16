import { test } from "./fixtures";

const ACCEPT = "אישור";

test.describe("baseline consent + pixel behaviour", () => {
  test("no facebook requests before consent", async ({ page, meta }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: ACCEPT, exact: true }).waitFor();
    await meta.expectNoRequests(1500);
  });

  test("PageView fires exactly once after accepting", async ({ page, meta }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: ACCEPT, exact: true }).click();
    await meta.expectEventOnce("PageView");
  });
});
