"use client";

import { useMemo, useState } from "react";
import {
  buildContactMessage,
  buildWhatsAppApiUrl,
  buildWhatsAppUrl,
  CONTACT_INSTAGRAM_HANDLE,
  INSTAGRAM_DM_URL,
  openExternalLink,
} from "@/lib/contact";
import { SOCIAL_LINKS } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";

type FormData = {
  name: string;
  company: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  company: "",
  message: "",
};

export function ContactSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [instagramHint, setInstagramHint] = useState<string | null>(null);
  const [whatsappHint, setWhatsappHint] = useState<string | null>(null);

  const composedMessage = useMemo(() => buildContactMessage(form), [form]);

  const whatsappUrl = useMemo(() => {
    if (!form.name.trim() || !form.company.trim()) {
      return null;
    }
    return buildWhatsAppUrl(composedMessage);
  }, [composedMessage, form.company, form.name]);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    setInstagramHint(null);
    setWhatsappHint(null);
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "נא למלא שם.";
    }
    if (!form.company.trim()) {
      return "נא למלא מאיפה / חברה / אירוע.";
    }
    return null;
  }

  function handleWhatsAppClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const error = validateForm();
    if (error) {
      event.preventDefault();
      setFormError(error);
      return;
    }
    setFormError(null);
  }

  async function copyWhatsAppLink() {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    const url = buildWhatsAppUrl(composedMessage);
    try {
      await navigator.clipboard.writeText(url);
      setFormError(null);
      setWhatsappHint("קישור הוואטסאפ הועתק — הדביקו אותו בדפדפן או בוואטסאפ.");
    } catch {
      setFormError("לא הצלחנו להעתיק. השתמשו בקישור למטה.");
    }
  }

  async function openInstagram() {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const message = buildContactMessage(form);
    try {
      await navigator.clipboard.writeText(message);
      setInstagramHint("ההודעה הועתקה — הדביקו אותה באינסטגרם אחרי שהצ'אט נפתח.");
    } catch {
      setInstagramHint("פתחו את האינסטגרם ושלחו לנו את ההודעה שם.");
    }
    openExternalLink(INSTAGRAM_DM_URL);
  }

  return (
    <section
      id="contact"
      className="border-t-[3px] border-cream bg-black px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionHeading align="left" title="Ready to rock your people?" />
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.12em] text-cream/70">
            Follow us on Instagram
          </p>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-base font-medium tracking-wide text-cream/90 underline-offset-4 transition hover:text-cream hover:underline"
          >
            @{CONTACT_INSTAGRAM_HANDLE}
          </a>
        </div>

        <div
          className="border-[3px] border-cream p-6 sm:p-8"
          lang="he"
          dir="rtl"
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
            <FormField label="שם" htmlFor="contact-name">
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass}
                placeholder="השם שלכם"
              />
            </FormField>

            <FormField label="מאיפה / חברה / אירוע" htmlFor="contact-company">
              <input
                id="contact-company"
                name="company"
                type="text"
                required
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                className={inputClass}
                placeholder="לדוגמה: ניצנים, אירוע חברה, סדנה…"
              />
            </FormField>

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
          </div>

          {formError ? (
            <p className="mt-6 font-hebrew text-sm font-medium text-[#ff6b6b]" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={whatsappUrl ?? "#"}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] px-6 py-2 font-hebrew text-sm font-medium text-[#0a0a0a] no-underline transition hover:bg-transparent hover:text-[#25D366] sm:min-w-[200px]"
            >
              <WhatsAppIcon />
              שליחה בוואטסאפ
            </a>

            <button
              type="button"
              onClick={openInstagram}
              className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 border border-cream bg-cream px-6 py-2 font-hebrew text-sm font-medium text-black transition hover:bg-transparent hover:text-cream sm:min-w-[200px]"
            >
              <InstagramIcon />
              שליחה באינסטגרם
            </button>
          </div>

          {whatsappHint ? (
            <p className="mt-4 font-hebrew text-sm text-cream/70" role="status">
              {whatsappHint}
            </p>
          ) : instagramHint ? (
            <p className="mt-4 font-hebrew text-sm text-cream/70" role="status">
              {instagramHint}
            </p>
          ) : (
            <p className="mt-4 font-hebrew text-sm text-cream/50">
              בוואטסאפ ההודעה תיפתח מוכנה לשליחה. באינסטגרם ההודעה מועתקת להדבקה בצ&apos;אט.
            </p>
          )}

          {whatsappUrl ? (
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
                  wa.me — פתיחה בוואטסאפ
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
          ) : null}

          <details className="mt-6 border-t border-cream/20 pt-4">
            <summary className="cursor-pointer font-hebrew text-xs font-semibold tracking-wide text-cream/50 hover:text-cream/80">
              תצוגה מקדימה של ההודעה
            </summary>
            <pre className="mt-3 whitespace-pre-wrap font-hebrew text-sm leading-relaxed text-cream/70">
              {composedMessage}
            </pre>
          </details>
        </div>
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

function InstagramIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const inputClass =
  "w-full border-2 border-cream/30 bg-transparent px-4 py-3 font-hebrew text-sm text-cream placeholder:text-cream/40 outline-none transition focus:border-cream";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-hebrew text-xs font-semibold tracking-wide text-cream/80"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
