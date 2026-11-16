import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Network isolation + assertions for the Meta pixel.
 *
 * installMetaNetwork(pageOrContext) intercepts EVERY request to *.facebook.com,
 * *.facebook.net and connect.facebook.net with route.fulfill - nothing leaves the
 * sandbox. fbevents.js is served from a local stub (./fbevents-stub.js) that
 * reproduces the real pixel's GET to https://www.facebook.com/tr/?id&ev&eid&cd[..].
 */

const FB_HOST = /^https?:\/\/([^/]+\.)?(facebook\.com|facebook\.net|fbcdn\.net)(:\d+)?\//i;
const STUB = readFileSync(path.join(__dirname, "fbevents-stub.js"), "utf8");
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export type PixelHit = {
  event: string;
  eventID?: string;
  pixelId: string;
  customData: Record<string, string>;
  url: string;
  method: string;
};

export type ParamsSubset = Record<string, string | number | boolean>;

export class MetaNetwork {
  /** Every request that targeted a facebook host (script + pixel hits + anything else). */
  readonly requests: { url: string; method: string }[] = [];
  /** Parsed pixel hits (requests to /tr). */
  readonly hits: PixelHit[] = [];

  /** Hits for one event name. */
  eventsNamed(name: string): PixelHit[] {
    return this.hits.filter((h) => h.event === name);
  }

  /** Forget everything recorded so far (e.g. after consent, before the action under test). */
  clear() {
    this.requests.length = 0;
    this.hits.length = 0;
  }

  /** Hits matching name and (optionally) a subset of customData / eventID / pixelId. */
  matching(
    name: string,
    subset: ParamsSubset & { eventID?: string; pixelId?: string } = {},
  ): PixelHit[] {
    const { eventID, pixelId, ...params } = subset;
    return this.eventsNamed(name).filter(
      (h) =>
        (eventID === undefined || h.eventID === eventID) &&
        (pixelId === undefined || h.pixelId === pixelId) &&
        Object.entries(params).every(([k, v]) => h.customData[k] === String(v)),
    );
  }

  /** Wait until at least one matching hit exists, then assert there is EXACTLY one (after a settle delay). */
  async expectEventOnce(
    name: string,
    paramsSubset: ParamsSubset & { eventID?: string; pixelId?: string } = {},
    opts: { timeout?: number; settleMs?: number } = {},
  ): Promise<PixelHit> {
    const { timeout = 10_000, settleMs = 750 } = opts;
    await expect
      .poll(() => this.matching(name, paramsSubset).length, {
        timeout,
        message: `waiting for pixel event ${name}`,
      })
      .toBeGreaterThan(0);
    await new Promise((r) => setTimeout(r, settleMs));
    const found = this.matching(name, paramsSubset);
    expect(found, `pixel event ${name} should fire exactly once`).toHaveLength(1);
    return found[0];
  }

  /** Assert an event never fired (matching optional params), after a settle delay. */
  async expectNoEvent(name: string, paramsSubset: ParamsSubset = {}, settleMs = 750) {
    await new Promise((r) => setTimeout(r, settleMs));
    expect(this.matching(name, paramsSubset)).toHaveLength(0);
  }

  /** Assert nothing at all was requested from facebook hosts. */
  async expectNoRequests(settleMs = 1000) {
    await new Promise((r) => setTimeout(r, settleMs));
    expect(this.requests.map((r) => r.url)).toEqual([]);
  }
}

function parseHit(url: string, method: string, body: string | null): PixelHit | null {
  const u = new URL(url);
  if (!/^\/tr\/?$/.test(u.pathname)) return null;
  const params = new URLSearchParams(u.search);
  if (body) new URLSearchParams(body).forEach((v, k) => params.set(k, v));
  const customData: Record<string, string> = {};
  params.forEach((v, k) => {
    const m = /^cd\[(.+)\]$/.exec(k);
    if (m) customData[m[1]] = v;
  });
  return {
    event: params.get("ev") ?? "",
    eventID: params.get("eid") ?? undefined,
    pixelId: params.get("id") ?? "",
    customData,
    url,
    method,
  };
}

/** Install on a Page or BrowserContext BEFORE navigation. Returns the recorder. */
export async function installMetaNetwork(target: Page | BrowserContext): Promise<MetaNetwork> {
  const net = new MetaNetwork();
  await target.route(FB_HOST, async (route) => {
    const req = route.request();
    const url = req.url();
    net.requests.push({ url, method: req.method() });
    if (/\/fbevents\.js(\?|$)/.test(url)) {
      return route.fulfill({
        status: 200,
        contentType: "application/javascript",
        headers: { "cache-control": "no-store" },
        body: STUB,
      });
    }
    const hit = parseHit(url, req.method(), req.postData());
    if (hit) net.hits.push(hit);
    return route.fulfill({ status: 200, contentType: "image/gif", body: GIF });
  });
  return net;
}
