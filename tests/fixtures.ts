import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test as base, expect } from "@playwright/test";
import { installMetaNetwork, type MetaNetwork } from "./helpers/meta-network";

type NetEntry = Record<string, unknown> & { t: number; kind: string };

const FB_HOST = /^https?:\/\/([^/]+\.)?(facebook\.com|facebook\.net|fbcdn\.net)(:\d+)?\//i;

/**
 * Optional network recorder for the audit report (scripts/network-report.mjs).
 * Active only when NETWORK_DUMP_DIR is set; otherwise it does nothing. Records, in order, every
 * facebook-bound request, every /api/meta/event and /api/lead call (with the server's answer) and
 * every WhatsApp navigation, and writes one JSON file per test.
 */
export const test = base.extend<{ meta: MetaNetwork; netlog: void }>({
  meta: async ({ context }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback, not a React hook
    await use(await installMetaNetwork(context));
  },
  netlog: [
    async ({ context }, use, testInfo) => {
      const dir = process.env.NETWORK_DUMP_DIR;
      const entries: NetEntry[] = [];
      const t0 = Date.now();
      if (dir) {
        context.on("request", (req) => {
          const url = req.url();
          const t = Date.now() - t0;
          if (FB_HOST.test(url)) {
            entries.push({ t, kind: "facebook-request", url, method: req.method(), post: req.postData() });
          } else if (url.includes("/api/meta/event") || url.includes("/api/lead")) {
            entries.push({ t, kind: url.includes("/api/lead") ? "lead-call" : "capi-call", url, post: req.postData() });
          } else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url)) {
            entries.push({ t, kind: "whatsapp", url });
          }
        });
        context.on("response", async (res) => {
          const url = res.url();
          if (!url.includes("/api/meta/event") && !url.includes("/api/lead")) return;
          let body: unknown = null;
          try {
            body = await res.json();
          } catch {}
          entries.push({ t: Date.now() - t0, kind: "response", url, status: res.status(), body });
        });
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback, not a React hook
      await use();
      if (dir) {
        mkdirSync(dir, { recursive: true });
        const name = `${testInfo.project.name}--${testInfo.titlePath.slice(1).join(" > ")}`
          .replace(/[^\p{L}\p{N}]+/gu, "_")
          .slice(0, 150);
        writeFileSync(
          path.join(dir, `${name}.json`),
          JSON.stringify(
            {
              project: testInfo.project.name,
              title: testInfo.titlePath.slice(1).join(" > "),
              status: testInfo.status,
              entries,
            },
            null,
            2,
          ),
        );
      }
    },
    { auto: true },
  ],
});

export { expect };
