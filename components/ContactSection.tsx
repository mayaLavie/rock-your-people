"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  buildContactMessage,
  buildWhatsAppApiUrl,
  buildWhatsAppUrl,
  CONTACT_INSTAGRAM_HANDLE,
  openExternalLink,
  WHATSAPP_CHAT_URL,
} from "@/lib/contact";
import { EVENT_TYPES, LEAD_ROUTE } from "@/lib/tracking/config";
import { parseHebrewDate, validateLead } from "@/lib/tracking/phone";
import {
  detectProduct,
  PRODUCT_NAMES_HE,
  type ProductOrGeneral,
} from "@/lib/tracking/products";
import { readAttribution } from "@/lib/tracking/attribution";
import { LEAD_SUBMIT_ATTR } from "@/lib/tracking/clicks";
import { resolveLeadMode, type LeadMode } from "@/lib/tracking/config";
import { newEventId, track, trackingEnabled } from "@/lib/tracking/track";
import { SOCIAL_LINKS } from "@/lib/constants";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";

type FormData = {
  name: string;
  company: string;
  message: string;
  /** form mode only, all optional: sent to the lead webhook and the WhatsApp text, never to Meta */
  eventType: string;
  headcount: string;
  eventDate: string;
};

type FieldErrors = { name?: string; phone?: string; eventDate?: string };

const initialForm: FormData = {
  name: "",
  company: "",
  message: "",
  eventType: "",
  headcount: "",
  eventDate: "",
};

export function ContactSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const [whatsappHint, setWhatsappHint] = useState<string | null>(null);
  // Lead mode and product are resolved in the browser (the product comes from the
  // closest [data-product] ancestor, so landing pages need no props).
  const [leadMode, setLeadMode] = useState<LeadMode>("whatsapp");
  const [product, setProduct] = useState<ProductOrGeneral>("general");
  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setProduct(detectProduct(node));
    setLeadMode(resolveLeadMode());
  }, []);

  const composedMessage = useMemo(() => {
    const base = buildContactMessage(form);
    const withProduct =
      product === "general"
        ? base
        : `${base} (מתעניינ/ת ב: ${PRODUCT_NAMES_HE[product]})`;
    if (leadMode !== "form") return withProduct;
    const extras: string[] = [];
    if (form.eventType) extras.push(`סוג אירוע: ${form.eventType}`);
    if (form.headcount.trim()) extras.push(`מספר משתתפים: ${form.headcount.trim()}`);
    if (form.eventDate.trim()) extras.push(`תאריך: ${form.eventDate.trim()}`);
    return extras.length ? `${withProduct}\n${extras.join(" | ")}` : withProduct;
  }, [form, product, leadMode]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(composedMessage),
    [composedMessage],
  );

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setWhatsappHint(null);
    if (field === "name") setErrors((e) => ({ ...e, name: undefined }));
    if (field === "eventDate") setErrors((e) => ({ ...e, eventDate: undefined }));
  }

  /**
   * whatsapp mode: the submit link is handled here (the global Contact listener skips it).
   * It is a Lead only when the visitor actually wrote something: a name AND a company or a message.
   * An empty (or name-only) click just opens WhatsApp, which is a Contact.
   */
  function handleWhatsAppSubmitClick() {
    const filled =
      form.name.trim() !== "" &&
      (form.company.trim() !== "" || form.message.trim() !== "");
    if (filled) {
      track("Lead", { content_name: product, lead_type: "whatsapp_click" });
    } else {
      track("Contact", { content_name: product, placement: "contact-form" });
    }
  }

  /** form mode: validate, send the lead, fire Lead, then always open WhatsApp. */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadMode !== "form") return;

    const found: FieldErrors = validateLead(form.name, phone);
    const isoDate = form.eventDate.trim() ? parseHebrewDate(form.eventDate) : "";
    if (isoDate === null) {
      found.eventDate = "התאריך לא תקין. כתבו יום/חודש/שנה, למשל 14/02/2027, או השאירו ריק.";
    }
    setErrors(found);
    if (found.name || found.phone || found.eventDate) {
      const id = found.name ? "contact-name" : found.phone ? "contact-phone" : "contact-date";
      if (found.eventDate && !found.name && !found.phone) setDetailsOpen(true);
      // The details panel may have just opened: focus after it is rendered visible.
      setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }

    const eventId = trackingEnabled() ? newEventId() : undefined;
    const consented = Boolean(eventId);
    // Everything below is fire-and-forget so the WhatsApp window opens inside the
    // click (popup blockers) and a failing API can never block the visitor.
    fetch(LEAD_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: form.name.trim(),
        phone: phone.trim(),
        company: form.company.trim(),
        message: form.message.trim(),
        event_type: form.eventType,
        headcount: form.headcount.trim(),
        event_date: isoDate ?? "",
        product,
        utm: consented ? readAttribution().utm : {},
        page: window.location.pathname,
        event_id: eventId,
      }),
    }).catch(() => {});
    track(
      "Lead",
      { content_name: product, lead_type: "form" },
      {
        eventId,
        userData: { phone: phone.trim(), firstName: form.name.trim() },
      },
    );
    openExternalLink(buildWhatsAppUrl(composedMessage));
  }

  async function copyWhatsAppLink() {
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setWhatsappHint("קישור הוואטסאפ הועתק — הדביקו אותו בדפדפן או בוואטסאפ.");
    } catch {
      setWhatsappHint("לא הצלחנו להעתיק. השתמשו בקישור למטה.");
    }
  }

  const companyField = (
    <FormField label="מאיפה / חברה / אירוע" htmlFor="contact-company">
      <input
        id="contact-company"
        name="company"
        type="text"
        value={form.company}
        onChange={(e) => updateField("company", e.target.value)}
        className={inputClass}
        placeholder="לדוגמה: ניצנים, אירוע חברה, סדנה…"
      />
    </FormField>
  );
  const messageField = (
    <FormField label="הודעה" htmlFor="contact-message">
      <textarea
        id="contact-message"
        name="message"
        rows={4}
        value={form.message}
        onChange={(e) => updateField("message", e.target.value)}
        className={`${inputClass} min-h-[100px] resize-y`}
        placeholder="תאריכים, מיקום, גודל קהל, מה מחפשים…"
      />
    </FormField>
  );

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      lang="he"
      id="contact"
      className="border-t-[3px] border-cream bg-black px-4 pb-16 pt-[40px] sm:px-6 sm:pb-24 lg:px-10"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            title="מוכנים לגרום לאנשים שלכם לרקוד?"
            titleClassName="!font-hebrew !normal-case font-bold text-right"
          />
          <p className="mt-6 font-hebrew text-sm font-medium tracking-wide text-cream/70">
            עקבו אחרינו באינסטגרם
          </p>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="mt-2 inline-block text-base font-medium tracking-wide text-cream/90 underline-offset-4 transition hover:text-cream hover:underline"
          >
            @{CONTACT_INSTAGRAM_HANDLE}
          </a>
        </div>

        <form
          className="border-[3px] border-cream p-6 sm:p-8"
          noValidate
          onSubmit={handleFormSubmit}
        >
          <p className="font-hebrew text-xs font-semibold tracking-wide text-cream/60">
            ההודעה שלכם
          </p>
          <h3
            id="contact-heading"
            className="mt-2 font-hebrew text-pretty text-xl font-medium leading-snug text-cream sm:text-2xl"
          >
            ספרו לנו על האירוע או השאירו פרטים ונחזור אליכם
          </h3>

          <div className="mt-6 grid gap-5">
            <FormField
              label="שם"
              htmlFor="contact-name"
              required={leadMode === "form"}
              error={errors.name}
            >
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass}
                placeholder="השם שלכם"
                required={leadMode === "form"}
                aria-required={leadMode === "form" || undefined}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
            </FormField>

            {leadMode === "form" ? (
              <FormField
                label="טלפון"
                htmlFor="contact-phone"
                required
                error={errors.phone}
              >
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((er) => ({ ...er, phone: undefined }));
                  }}
                  className={`${inputClass} text-right placeholder:text-right`}
                  placeholder="050-1234567"
                  required
                  aria-required="true"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={
                    errors.phone ? "contact-phone-error" : undefined
                  }
                />
              </FormField>
            ) : null}

            {leadMode === "form" ? (
              <div>
                <button
                  type="button"
                  aria-expanded={detailsOpen}
                  aria-controls={detailsId}
                  onClick={() => setDetailsOpen((o) => !o)}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 border-2 border-cream/30 px-4 py-2 text-start font-hebrew text-sm font-semibold text-cream transition hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  <span>הוסיפו פרטים על האירוע (לא חובה)</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className={`h-3 w-3 shrink-0 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>
                <div id={detailsId} hidden={!detailsOpen} className="mt-5 grid gap-5">
                  {companyField}
                  {messageField}
                  <FormField label="סוג האירוע" htmlFor="contact-event-type">
                    <select
                      id="contact-event-type"
                      name="eventType"
                      value={form.eventType}
                      onChange={(e) => updateField("eventType", e.target.value)}
                      className={`${inputClass} bg-black`}
                    >
                      <option value="">בחרו סוג אירוע</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="מספר משתתפים" htmlFor="contact-headcount">
                      <input
                        id="contact-headcount"
                        name="headcount"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={100000}
                        value={form.headcount}
                        onChange={(e) => updateField("headcount", e.target.value)}
                        className={inputClass}
                        placeholder="לדוגמה: 60"
                      />
                    </FormField>
                    <FormField
                      label="תאריך משוער"
                      htmlFor="contact-date"
                      error={errors.eventDate}
                    >
                      <input
                        id="contact-date"
                        name="eventDate"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        lang="he"
                        dir="ltr"
                        maxLength={10}
                        value={form.eventDate}
                        onChange={(e) => updateField("eventDate", e.target.value)}
                        className={`${inputClass} text-right placeholder:text-right`}
                        placeholder="יום/חודש/שנה"
                        aria-invalid={errors.eventDate ? true : undefined}
                        aria-describedby={errors.eventDate ? "contact-date-error" : undefined}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {companyField}
                {messageField}
              </>
            )}
          </div>

          <div className="mt-8">
            {leadMode === "form" ? (
              <button type="submit" className={submitClass}>
                <WhatsAppIcon />
                שליחה בוואטסאפ
              </button>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                {...{ [LEAD_SUBMIT_ATTR]: "" }}
                onClick={handleWhatsAppSubmitClick}
                className={submitClass}
              >
                <WhatsAppIcon />
                שליחה בוואטסאפ
              </a>
            )}
          </div>

          {leadMode === "form" ? (
            <p className="mt-3 font-hebrew text-xs leading-relaxed text-cream/75">
              הפרטים יישלחו אל Rock Your People כדי לחזור אליכם בנוגע לאירוע.
              פרטים נוספים ב
              <Link href="/privacy" className="underline underline-offset-2">
                מדיניות הפרטיות
              </Link>
              .
            </p>
          ) : (
            <p className="mt-3 font-hebrew text-xs text-cream/75">
              ההודעה תיפתח בוואטסאפ, ושם תחליטו אם לשלוח אותה.
            </p>
          )}

          {whatsappHint ? (
            <p className="mt-4 font-hebrew text-sm text-cream/80" role="status">
              {whatsappHint}
            </p>
          ) : leadMode === "form" ? (
            <p className="mt-4 font-hebrew text-sm text-cream/70">
              מלאו שם וטלפון ולחצו על שליחה. נשמור את הפרטים כדי לחזור אליכם,
              ובמקביל תיפתח שיחת וואטסאפ עם ההודעה שלכם, מוכנה לשליחה.
            </p>
          ) : (
            <p className="mt-4 font-hebrew text-sm text-cream/70">
              אפשר למלא את הפרטים ולשלוח, או לפתוח וואטסאפ ישירות. ההודעה תיפתח
              מוכנה לשליחה (גם אם השדות ריקים).
            </p>
          )}

          <details className="group mt-4 font-hebrew text-sm text-cream/60">
            <summary className="cursor-pointer list-none text-cream/70 marker:content-none hover:text-cream [&::-webkit-details-marker]:hidden">
              לא נפתח?{" "}
              <span className="underline underline-offset-2 group-open:no-underline">
                לחצו פה
              </span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-cream/15 pt-3">
              <p className="text-cream/50">לחצו ישירות (או הדביקו בדפדפן):</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#25D366] underline underline-offset-2 hover:text-[#25D366]/80"
              >
                wa.me — פתיחה עם ההודעה מהטופס
              </a>
              <a
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#25D366] underline underline-offset-2 hover:text-[#25D366]/80"
              >
                wa.me — פתיחה ישירה בלי הודעה מוכנה
              </a>
              <a
                href={buildWhatsAppApiUrl(composedMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#25D366] underline underline-offset-2 hover:text-[#25D366]/80"
              >
                api.whatsapp.com — קישור חלופי
              </a>
              <button
                type="button"
                onClick={copyWhatsAppLink}
                className="font-hebrew text-sm text-cream/80 underline underline-offset-2 hover:text-cream"
              >
                העתקת קישור wa.me
              </button>
              <p className="text-xs text-cream/40">
                אם כלום לא קורה, בדקו חוסם פרסומות (uBlock וכו&apos;) — לפעמים הוא
                חוסם קישורי וואטסאפ.
              </p>
            </div>
          </details>

          <details className="mt-6 border-t border-cream/20 pt-4">
            <summary className="cursor-pointer font-hebrew text-xs font-semibold tracking-wide text-cream/50 hover:text-cream/80">
              תצוגה מקדימה של ההודעה
            </summary>
            <pre className="mt-3 whitespace-pre-wrap font-hebrew text-sm leading-relaxed text-cream/70">
              {composedMessage}
            </pre>
          </details>
        </form>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const submitClass =
  "inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-[#25D366] bg-[#25D366] px-6 py-2 font-hebrew text-sm font-medium text-[#0a0a0a] no-underline transition hover:bg-[#3ee27a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:w-auto sm:min-w-[200px]";

const inputClass =
  "w-full border-2 border-cream/30 bg-transparent px-4 py-3 font-hebrew text-sm text-cream placeholder:text-cream/60 outline-none transition focus:border-cream";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function FormField({ label, htmlFor, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-hebrew text-xs font-semibold tracking-wide text-cream/80"
      >
        {label}
        {required ? (
          <span aria-hidden className="text-[#ffe34d]">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-2 font-hebrew text-sm text-[#ffb4b4]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
