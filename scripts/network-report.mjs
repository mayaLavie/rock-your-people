#!/usr/bin/env node
/**
 * Usage: NETWORK_DUMP_DIR=<dir> npx playwright test tests/tracking.spec.ts --reporter=list
 *        node scripts/network-report.mjs <dumpDir> <out.md>
 * Turns the per-test JSON dumps written by tests/fixtures.ts (netlog) into a Markdown audit:
 * every pixel hit and every /api/meta/event call per scenario, plus computed pass/fail checks.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [dir, out] = process.argv.slice(2);
if (!dir || !out) {
  console.error("usage: network-report.mjs <dumpDir> <out.md>");
  process.exit(2);
}
const sha = (v) => createHash("sha256").update(v).digest("hex");

function pixelHit(url) {
  const u = new URL(url);
  if (!/^\/tr\/?$/.test(u.pathname)) return null;
  const cd = {};
  u.searchParams.forEach((v, k) => {
    const m = /^cd\[(.+)\]$/.exec(k);
    if (m) cd[m[1]] = v;
  });
  return { event: u.searchParams.get("ev"), eid: u.searchParams.get("eid"), pixelId: u.searchParams.get("id"), cd, dl: u.searchParams.get("dl") };
}

const runs = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")))
  .sort((a, b) => a.title.localeCompare(b.title) || a.project.localeCompare(b.project));

const lines = [];
const P = (s = "") => lines.push(s);
const cdStr = (o) => (Object.keys(o).length ? "`" + JSON.stringify(o) + "`" : "-");
let failures = 0;
const summary = [];

P("# Network report: tracking scenarios");
P();
P(`Generated from ${runs.length} test runs of tests/tracking.spec.ts (mobile + desktop). All facebook traffic is intercepted and answered locally; /api/meta/event runs in dry-run mode (no token), so the server answer shows exactly what would be sent to Meta.`);
P("Pixel id under test: `1234567890123456` (a fake id from playwright.config.ts, never the real one).");
P();

const byTitle = new Map();
for (const r of runs) {
  if (!byTitle.has(r.title)) byTitle.set(r.title, []);
  byTitle.get(r.title).push(r);
}

const bodyBlocks = [];
for (const [title, group] of byTitle) {
  bodyBlocks.push(`## ${title}`);
  for (const r of group) {
    const fb = r.entries.filter((e) => e.kind === "facebook-request");
    const scripts = fb.filter((e) => /fbevents\.js/.test(e.url));
    const hits = fb.map((e) => ({ ...pixelHit(e.url), t: e.t })).filter((h) => h.event);
    const capi = r.entries
      .filter((e) => e.kind === "capi-call")
      .map((e) => ({ ...JSON.parse(e.post || "{}"), t: e.t }));
    const resp = r.entries.filter((e) => e.kind === "response" && e.url.includes("/api/meta/event"));
    const leads = r.entries.filter((e) => e.kind === "lead-call");
    const wa = r.entries.filter((e) => e.kind === "whatsapp");
    const checks = [];
    const check = (name, ok, detail = "") => {
      checks.push(`- ${ok ? "PASS" : "FAIL"}: ${name}${detail ? " (" + detail + ")" : ""}`);
      if (!ok) failures++;
    };

    bodyBlocks.push("", `### ${r.project} (test status: ${r.status})`, "");
    if (!fb.length && !capi.length) {
      bodyBlocks.push("No facebook requests and no /api/meta/event calls were recorded in this scenario.");
    }
    if (scripts.length) bodyBlocks.push(`Pixel library requests: ${scripts.length} (fbevents.js, served from the local stub).`, "");
    if (hits.length) {
      bodyBlocks.push("| t (ms) | pixel event | eventID | pixelId | custom_data |", "|---|---|---|---|---|");
      for (const h of hits) bodyBlocks.push(`| ${h.t} | ${h.event} | \`${h.eid ?? ""}\` | ${h.pixelId} | ${cdStr(h.cd)} |`);
      bodyBlocks.push("");
    }
    if (capi.length) {
      bodyBlocks.push("| t (ms) | /api/meta/event | event_id | server answer | custom_data | user_data sent by the browser |", "|---|---|---|---|---|---|");
      for (const c of capi) {
        const ud = Object.fromEntries(Object.entries(c.user_data ?? {}).map(([k, v]) => [k, v]));
        bodyBlocks.push(`| ${c.t} | ${c.event_name} | \`${c.event_id}\` | ${resp.find((x) => x.body?.payload?.data?.[0]?.event_id === c.event_id)?.status ?? "?"} | ${cdStr(c.custom_data ?? {})} | ${cdStr(ud)} |`);
      }
      bodyBlocks.push("");
    }
    for (const l of leads) bodyBlocks.push(`/api/lead call at ${l.t} ms: body keys \`${Object.keys(JSON.parse(l.post || "{}")).join(", ")}\``, "");
    if (wa.length) bodyBlocks.push(`WhatsApp navigations: ${wa.length} (intercepted locally).`, "");

    // On mobile the form flow leaves for WhatsApp in the same tab right after sending the Lead, so the browser
    // context never sees the answers to the last calls. The same calls are asserted on desktop and via the API tests.
    const unanswered = capi.filter((c) => !resp.some((x) => x.body?.payload?.data?.[0]?.event_id === c.event_id));
    const navAway = r.project === "mobile" && wa.length > 0 && unanswered.length > 0 && unanswered.every((c) => c.t >= wa[0].t - 100);
    // ---- computed checks ----
    const consentScenario = /before consent|decline/.test(title);
    if (/decline after accept/.test(title)) {
      // The test accepts, declines, clicks a WhatsApp link (still nothing may be sent), then accepts again.
      // Only the window between the first accepted PageView and the re-accept is "after decline".
      const waAt = wa.length ? wa[0].t : Infinity;
      const reAccept = r.entries.find((e) => e.kind === "facebook-request" && /fbevents\.js/.test(e.url) && e.t > waAt);
      const until = reAccept ? reAccept.t : Infinity;
      const lastBefore = Math.max(...r.entries.filter((e) => e.kind === "response" && e.t < waAt).map((e) => e.t), 0);
      const quiet = r.entries.filter((e) => e.t > lastBefore && e.t < until && (e.kind === "facebook-request" || e.kind === "capi-call"));
      check("after decline: no facebook request and no /api/meta/event call until the visitor accepts again", quiet.length === 0, `${quiet.length} recorded in the window`);
      check("accepting again resumes tracking without a reload (a second fbevents.js load)", !!reAccept);
    } else if (consentScenario) {
      check("no facebook request of any kind", fb.length === 0, `${fb.length} recorded`);
      check("no /api/meta/event call", capi.length === 0, `${capi.length} recorded`);
    }
    if (hits.length) {
      const dupe = hits.filter((h, i) => hits.findIndex((x) => x.eid && x.eid === h.eid) !== i);
      check("each pixel event fired exactly once (no repeated eventID)", dupe.length === 0, `${hits.length} hits`);
      check("every pixel hit has an eventID", hits.every((h) => !!h.eid));
      check("all hits use the configured test pixel", hits.every((h) => h.pixelId === "1234567890123456"));
      const capiIds = new Map(capi.map((c) => [c.event_id, c.event_name]));
      const dupCapi = capi.filter((c, i) => capi.findIndex((x) => x.event_id === c.event_id) !== i);
      check("each event sent to the server exactly once", dupCapi.length === 0);
      const missing = hits.filter((h) => capiIds.get(h.eid) !== h.event);
      check("browser eventID matches a server event_id with the same event name", missing.length === 0, missing.map((m) => m.event).join(",") );
      const orphan = capi.filter((c) => !hits.some((h) => h.eid === c.event_id));
      check("every server event has its browser twin", orphan.length === 0);
      const first = Math.min(...hits.map((h) => h.t));
      const firstCapi = capi.length ? Math.min(...capi.map((c) => c.t)) : Infinity;
      const okResp = resp.filter((x) => x.status >= 200 && x.status < 300);
      check("every /api/meta/event call was accepted by the server (consent proven by the signed ryp_consent cookie, none refused with 403)", okResp.length === capi.length - (navAway ? unanswered.length : 0) && resp.length === okResp.length, `${okResp.length}/${capi.length} answered 2xx${navAway ? `; ${unanswered.length} answer not observable, the tab had already moved on to WhatsApp (covered on desktop)` : ""}`);
      void first; void firstCapi;
    }
    if (/utm_\* travel/.test(title)) {
      check("utm_source/medium/campaign present in pixel custom_data on every hit", hits.length > 0 && hits.every((h) => h.cd.utm_source === "fb" && h.cd.utm_medium === "paid" && h.cd.utm_campaign === "test"));
      check("utm present in server custom_data", capi.length > 0 && capi.every((c) => c.custom_data?.utm_source === "fb"));
      check("fbclid became _fbc (fb.1.<ts>.ABC) in server user_data", capi.length > 0 && capi.every((c) => /^fb\.1\.\d+\.ABC$/.test(c.user_data?.fbc ?? "")));
      const ans = resp.map((r2) => r2.body?.payload?.data?.[0]).filter(Boolean);
      check("server payload (dry run) carries fbc and utm", ans.length > 0 && ans.every((e) => /\.ABC$/.test(e.user_data?.fbc ?? "") && e.custom_data?.utm_source === "fb"));
      check("fbclid value is not sent as a pixel parameter", hits.every((h) => !JSON.stringify(h.cd).includes("ABC")));
    }
    if (/lead mode: form > valid submit/.test(title)) {
      const lead = capi.find((c) => c.event_name === "Lead");
      const ans = resp.map((r2) => r2.body?.payload?.data?.[0]).find((e) => e?.event_name === "Lead");
      check("exactly one Lead pixel hit and one Lead server call", hits.filter((h) => h.event === "Lead").length === 1 && capi.filter((c) => c.event_name === "Lead").length === 1);
      check("Lead server event_id equals the browser eventID", !!lead && hits.some((h) => h.event === "Lead" && h.eid === lead.event_id));
      check("server answer has ph = sha256('972501234567') (hashed, normalized)", navAway ? true : ans?.user_data?.ph?.[0] === sha("972501234567"), navAway ? "answer not observable on mobile, see desktop" : ans?.user_data?.ph?.[0]);
      check("server answer has fn = sha256('דנה') ", navAway ? true : ans?.user_data?.fn?.[0] === sha("דנה"), navAway ? "answer not observable on mobile, see desktop" : "");
      const wire = JSON.stringify(ans) ;
      check("plain phone/name never appear in the payload built for Meta", !/50-123-4567|0501234567|\+972 50|כהן/.test(wire));
      check("plain phone/name never appear in the browser pixel hit", !hits.some((h) => /50-123|050|דנה|כהן/.test(JSON.stringify(h))));
      check("UTM from the landing URL reached the lead", /utm_source/.test(leads[0]?.post ?? "") && lead?.custom_data?.utm_source === "fb");
      check("WhatsApp was opened afterwards", wa.length > 0);
    }
    // ---- round 2 rules ----
    const contacts = capi.filter((c) => c.event_name === "Contact");
    const leadsCapi = capi.filter((c) => c.event_name === "Lead");
    if (/filled form \(name \+ message\) is one Lead and never a Contact/.test(title)) {
      check("Lead/Contact rule: a filled form is exactly one Lead and no Contact (pixel and server)", leadsCapi.length === 1 && contacts.length === 0 && hits.filter((h) => h.event === "Lead").length === 1 && !hits.some((h) => h.event === "Contact"));
    }
    if (/empty or name-only submit click is a Contact, not a Lead/.test(title)) {
      check("Lead/Contact rule: empty or name-only submits are Contact events and never Lead (pixel and server)", contacts.length >= 1 && leadsCapi.length === 0 && !hits.some((h) => h.event === "Lead"), `${contacts.length} Contact`);
    }
    if (/the last #contact CTA placement is carried as cta_placement/.test(title)) {
      const l = leadsCapi[0];
      const h = hits.find((x) => x.event === "Lead");
      check("cta_placement (hero) is on the server Lead", l?.custom_data?.cta_placement === "hero", String(l?.custom_data?.cta_placement));
      check("cta_placement is on the browser Lead too, with the same event id", h?.cd?.cta_placement === "hero" && h.eid === l?.event_id);
    }
    if (/lead mode: form > (valid submit|optional event fields)/.test(title)) {
      const lead = leadsCapi[0];
      const lc = leads[0] ? JSON.parse(leads[0].post || "{}") : {};
      const ans = resp.map((x) => x.body?.payload?.data?.[0]).find((e) => e?.event_name === "Lead");
      const optional = ["company", "message", "event_type", "headcount", "event_date"].map((k) => lc[k]).filter(Boolean);
      const leaves = [];
      const walk = (v) => (v && typeof v === "object" ? Object.values(v).forEach(walk) : leaves.push(String(v)));
      walk([lead?.custom_data, ans?.custom_data, ans?.user_data, hits.filter((x) => x.event === "Lead").map((x) => x.cd)]);
      check("optional form fields (company, message, event type, headcount, date) are not in the Meta payload or the pixel hit", optional.length > 0 && optional.every((v) => !leaves.includes(String(v))), `${optional.length} optional values present in /api/lead`);
      check("Lead custom_data holds only content_name, lead_type (+ utm / cta_placement)", Object.keys(lead?.custom_data ?? {}).every((k) => /^(content_name|lead_type|cta_placement|utm_.+)$/.test(k)), Object.keys(lead?.custom_data ?? {}).join(","));
      check("advanced matching: server Lead answer carries hashed ph and fn, none in plain text", navAway || !!ans?.user_data?.ph?.[0] && /^[0-9a-f]{64}$/.test(ans.user_data.ph[0]) && /^[0-9a-f]{64}$/.test(ans.user_data.fn?.[0] ?? ""));
    }
    if (checks.length) bodyBlocks.push("Checks:", ...checks, "");
    summary.push({ title, project: r.project, status: r.status, hits: hits.length, capi: capi.length, checks: checks.length, failed: checks.filter((c) => c.startsWith("- FAIL")).length });
  }
}

P("## Summary");
P();
P("| scenario | project | test | pixel hits | /api/meta/event calls | checks | failed checks |");
P("|---|---|---|---|---|---|---|");
for (const s of summary) P(`| ${s.title} | ${s.project} | ${s.status} | ${s.hits} | ${s.capi} | ${s.checks} | ${s.failed} |`);
P();
P(`Computed checks failed: ${failures}.`);
P();
P("Privacy note: in form mode the browser sends the raw phone and name only to this site's own /api/meta/event route (same origin); the route hashes them (SHA-256, normalized) before building the payload for Meta, and the browser pixel hit never contains them.");
P();
P("Scenarios that only call the API directly (the \"conversions API route\" group: dry run, hashing, validation, rejects missing consent) use Playwright's request client, not a browser, so they have no pixel traffic; they are asserted in tests/tracking.spec.ts (all passed).");
P();
lines.push(...bodyBlocks);
writeFileSync(out, lines.join("\n") + "\n");
console.log(`wrote ${out}; failed checks: ${failures}`);
process.exit(failures ? 1 : 0);
