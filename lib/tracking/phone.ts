/** Israeli phone helpers, shared by the client form and the API routes. */

/** Keeps digits only; turns +972 / 972 / 00972 prefixes into the local leading 0. */
export function normalizeIsraeliPhone(input: string): string {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  digits = digits.replace(/\D/g, "");
  if (digits.startsWith("972")) digits = `0${digits.slice(3)}`;
  return digits;
}

/** Mobile 05X-XXXXXXX, landline 0[2-4,8,9]-XXXXXXX, VoIP 07X-XXXXXXX. */
export function isValidIsraeliPhone(input: string): boolean {
  return /^0(5\d{8}|[23489]\d{7}|7\d{8})$/.test(normalizeIsraeliPhone(input));
}

/** E.164 digits without "+", the shape Meta expects before hashing (972501234567). */
export function toInternationalDigits(input: string): string {
  const local = normalizeIsraeliPhone(input);
  return local.startsWith("0") ? `972${local.slice(1)}` : local;
}

export const LEAD_ERRORS = {
  nameRequired: "נא להזין שם",
  phoneRequired: "נא להזין מספר טלפון",
  phoneInvalid: "מספר הטלפון אינו תקין. לדוגמה: 050-1234567",
} as const;

export function validateLead(name: string, phone: string): {
  name?: string;
  phone?: string;
} {
  const errors: { name?: string; phone?: string } = {};
  if (!name.trim()) errors.name = LEAD_ERRORS.nameRequired;
  if (!phone.trim()) errors.phone = LEAD_ERRORS.phoneRequired;
  else if (!isValidIsraeliPhone(phone)) errors.phone = LEAD_ERRORS.phoneInvalid;
  return errors;
}

/** dd/mm/yyyy (also d.m.yy-style separators / and . and -) to ISO yyyy-mm-dd, or null when not a real date. */
export function parseHebrewDate(raw: string): string | null {
  const m = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(raw.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (year < 2000 || year > 2100) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
