export const CONTACT_WHATSAPP_PHONE = "972524632111";

export const CONTACT_INSTAGRAM_HANDLE = "rock.your.people";

export const CONTACT_INSTAGRAM_URL = `https://www.instagram.com/${CONTACT_INSTAGRAM_HANDLE}`;

export const INSTAGRAM_DM_URL = `https://ig.me/m/${CONTACT_INSTAGRAM_HANDLE}`;

export const WHATSAPP_CHAT_URL = `https://wa.me/${CONTACT_WHATSAPP_PHONE}`;

const WHATSAPP_API_URL = "https://api.whatsapp.com/send";

export type ContactMessageFields = {
  name: string;
  company: string;
  message: string;
};

export function buildContactMessage({
  name,
  company,
  message,
}: ContactMessageFields): string {
  const trimmedName = name.trim();
  const trimmedCompany = company.trim();
  const trimmedMessage = message.trim();

  const greeting = "היי רוק יור פיפל !";

  if (trimmedName) {
    const afterName: string[] = [];
    if (trimmedCompany) afterName.push(trimmedCompany);
    if (trimmedMessage) afterName.push(trimmedMessage);

    if (afterName.length === 0) {
      return `${greeting} אני ${trimmedName} ואני אשמח לקבל פרטים.`;
    }
    if (trimmedMessage) {
      return `${greeting} אני ${trimmedName}, ${afterName.join(", ")}`;
    }
    return `${greeting} אני ${trimmedName}, ${trimmedCompany} ואני אשמח לקבל פרטים.`;
  }

  if (trimmedCompany) {
    if (trimmedMessage) {
      return `${greeting} ${trimmedCompany}, ${trimmedMessage}`;
    }
    return `${greeting} אני ${trimmedCompany} ואני אשמח לקבל פרטים.`;
  }

  if (trimmedMessage) {
    return `${greeting} ${trimmedMessage}`;
  }

  return `${greeting} אני אשמח לקבל פרטים.`;
}

/** Primary — usually works best in Chrome (less blocked than api.whatsapp.com). */
export function buildWhatsAppUrl(text: string): string {
  return `${WHATSAPP_CHAT_URL}?text=${encodeURIComponent(text)}`;
}

/** Fallback link format. */
export function buildWhatsAppApiUrl(text: string): string {
  const params = new URLSearchParams({
    phone: CONTACT_WHATSAPP_PHONE,
    text,
  });
  return `${WHATSAPP_API_URL}?${params.toString()}`;
}

export function openExternalLink(url: string) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
