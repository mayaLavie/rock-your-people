import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Browser binary: PLAYWRIGHT_CHROMIUM_PATH wins, then a system Chrome/Chromium
 * (the sandbox ships /usr/bin/google-chrome), else Playwright's own download.
 */
const SYSTEM_CHROME = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => p && existsSync(p));

const launchOptions = {
  executablePath: SYSTEM_CHROME,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
};

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL, launchOptions },
  projects: [
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    // Build-time public env for the tests: a fake pixel id, and the switch that lets
    // tracking-form.spec.ts flip the lead mode per browser. Never real values.
    env: {
      NEXT_PUBLIC_META_PIXEL_ID: "1234567890123456",
      NEXT_PUBLIC_E2E: "1",
      // Make sure nothing from the developer's shell turns the server routes "live".
      META_CAPI_ACCESS_TOKEN: "",
      META_CAPI_ENDPOINT: "",
      META_TEST_EVENT_CODE: "",
      LEAD_WEBHOOK_URL: "",
    },
    timeout: 300_000,
  },
});
