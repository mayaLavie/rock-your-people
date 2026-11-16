import { CONTACT_INSTAGRAM_URL, CONTACT_WHATSAPP_PHONE } from "@/lib/contact";

import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";
import { TITLE_IMAGE } from "@/lib/constants";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "PerformingGroup",
    name: "Rock Your People",
    url: SITE_URL,
    logo: `${SITE_URL}${encodeURI(TITLE_IMAGE.src)}`,
    image: `${SITE_URL}/og/og-default.jpg`,
    description: SITE_DESCRIPTION,
    inLanguage: "he",
    sameAs: [CONTACT_INSTAGRAM_URL],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: `+${CONTACT_WHATSAPP_PHONE}`,
      availableLanguage: ["he"],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
