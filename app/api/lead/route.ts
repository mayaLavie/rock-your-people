import { isValidIsraeliPhone, normalizeIsraeliPhone } from "@/lib/tracking/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clip(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function flatStrings(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (/^[a-z_]{1,32}$/.test(k) && typeof val === "string") out[k] = val.slice(0, 200);
  }
  return out;
}

/**
 * Receives the contact form in LEAD_MODE=form and forwards it to LEAD_WEBHOOK_URL
 * (Zapier / Make / Apps Script ...). Without a webhook it answers 202 dry-run.
 * The raw phone and name are never logged.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = clip(body.name, 120);
  const phoneRaw = clip(body.phone, 40);
  if (!name || !isValidIsraeliPhone(phoneRaw)) {
    return Response.json({ ok: false, error: "invalid_lead" }, { status: 400 });
  }

  const lead = {
    name,
    phone: normalizeIsraeliPhone(phoneRaw),
    company: clip(body.company, 200),
    message: clip(body.message, 2000),
    product: clip(body.product, 40) || "general",
    utm: flatStrings(body.utm),
    page: clip(body.page, 2000),
    event_id: clip(body.event_id, 64) || undefined,
    received_at: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[lead] dry run (no LEAD_WEBHOOK_URL), product=${lead.product}`);
    }
    return Response.json({ ok: true, dryRun: true }, { status: 202 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error(`[lead] webhook answered ${res.status}`);
      return Response.json({ ok: false, error: "webhook_error" }, { status: 502 });
    }
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    console.error("[lead] webhook request failed");
    return Response.json({ ok: false, error: "webhook_unreachable" }, { status: 502 });
  }
}
