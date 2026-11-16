import { createHash } from "node:crypto";
import { ALLOWED_EVENTS, type MetaEventName } from "./config";
import { toInternationalDigits } from "./phone";

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function isAllowedEvent(name: unknown): name is MetaEventName {
  return (
    typeof name === "string" &&
    (ALLOWED_EVENTS as readonly string[]).includes(name)
  );
}

/** Meta normalisation: digits with country code, then SHA-256. */
export function hashPhone(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const digits = toInternationalDigits(raw);
  return digits.length >= 8 ? sha256(digits) : undefined;
}

/** Meta normalisation for first name: trimmed, lowercase, first word, no punctuation. */
export function hashFirstName(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const first = raw
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    ?.replace(/[^\p{L}\p{N}]/gu, "");
  return first ? sha256(first) : undefined;
}

/** Keeps a flat object of short primitives only. */
export function sanitizeCustomData(
  input: unknown,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  let count = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (count >= 40) break;
    if (!/^[A-Za-z0-9_]{1,64}$/.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 300);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
    else continue;
    count++;
  }
  return out;
}

export function graphVersion(): string {
  const v = (process.env.META_GRAPH_VERSION || "v21.0").trim();
  return v.startsWith("v") ? v : `v${v}`;
}
