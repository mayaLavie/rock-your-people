import { FAQ_ITEMS, GALLERY_IMAGES, PRODUCTS } from "@/lib/constants";
import { PRODUCT_DETAIL_SECTIONS } from "@/lib/product-details";
import type { ProductSlug } from "@/lib/tracking/products";

/*
 * Content for the paid-traffic landing pages (/lp/<slug>).
 * Every sentence comes from the existing site copy (lib/constants.ts and
 * lib/product-details.ts) or is a direct rewording of facts stated there.
 */

export const LANDING_SLUGS = [
  "on-stage",
  "band-in-a-day",
  "trio-360",
  "rock-your-dj",
] as const;

export type LandingSlug = (typeof LANDING_SLUGS)[number];

export function isLandingSlug(value: string): value is LandingSlug {
  return (LANDING_SLUGS as readonly string[]).includes(value);
}

export type LandingBlock = {
  heading: string;
  paragraphs?: readonly string[];
  bulletsHeading?: string;
  bullets?: readonly string[];
  closing?: string;
};

export type LandingContent = {
  slug: LandingSlug;
  /** Product name as shown in the h1 */
  name: string;
  /** Short name used inside Hebrew sentences / CTA */
  ctaTarget: string;
  /** Who it is for, one line above the h1 */
  audience: string;
  /** One value line: who + outcome */
  valueLine: string;
  metaDescription: string;
  hero: { src: string; alt: string; position: string };
  experience: LandingBlock;
  /** Optional second format shown on the same page */
  extra?: LandingBlock & {
    name: string;
    /** Tracking slug of the product this block describes, when it differs from the page product. */
    product?: ProductSlug;
  };
  fits: { heading: string; text: string; chips: readonly string[] };
  faq: readonly (typeof FAQ_ITEMS)[number][];
};

type Detail = {
  headline: string;
  subheadline: string;
  body: string;
  bodyParagraphs: readonly string[];
  bulletsHeading: string;
  bullets: readonly string[];
  secondaryBulletsHeading?: string;
  secondaryBullets?: readonly string[];
  closingBody: string;
};

function detail(id: string): Detail {
  const found = PRODUCT_DETAIL_SECTIONS.find((d) => d.id === id);
  if (!found) throw new Error(`Missing product detail: ${id}`);
  return found as Detail;
}

const stage = detail("your-people-on-stage");
const workshop = detail("leadership-workshop");
const dj = detail("trio-360");
const beer = detail("beer-office");

const trioProduct = PRODUCTS.find((p) => p.id === "trio-360");
if (!trioProduct) throw new Error("Missing product: trio-360");

const faq = (...indexes: number[]) => indexes.map((i) => FAQ_ITEMS[i]);

export const USE_CASE_INTRO =
  'החוויות והסדנאות שלנו תפורות ומותאמות אישית לכל לו"ז או צורך לאורך השנה:';

const stageBulletsForFit = stage.bullets[3] ?? "";

export const LANDING_CONTENT: Record<LandingSlug, LandingContent> = {
  "on-stage": {
    slug: "on-stage",
    name: stage.headline,
    ctaTarget: "המופע",
    audience: "מופע חשמלי חי לאירועי חברה, ערבי קהילה ואירועים פרטיים",
    valueLine:
      "האנשים שלכם שרים ומנגנים איתנו על הבמה, עם להקה מקצועית שדואגת לכל המעטפת. הם הכוכבים של הערב.",
    metaDescription:
      "מופע חי ואינטראקטיבי שבו האנשים שלכם שרים ומנגנים על הבמה עם להקה מקצועית. לאירועי חברה, ערבי קהילה ואירועים פרטיים.",
    hero: {
      src: "/images/evyatar stage.jpeg",
      alt: "אביתר שר על הבמה בהופעה של Rock Your People",
      position: "50% 40%",
    },
    experience: {
      heading: "מה קורה במופע",
      paragraphs: [stage.body],
      bulletsHeading: "מה זה נותן",
      bullets: stage.bullets.slice(0, 3),
    },
    fits: {
      heading: "למי זה מתאים",
      text: stageBulletsForFit,
      chips: [
        "אירועי חברה",
        "ערבי קהילה",
        "אירועים פרטיים",
        "ימי גיבוש",
        "מסיבות סוף שנה",
      ],
    },
    faq: faq(1, 2, 5, 4, 6),
  },

  "band-in-a-day": {
    slug: "band-in-a-day",
    name: workshop.headline,
    ctaTarget: "Band in a Day",
    audience: workshop.subheadline,
    valueLine:
      "הצוות שלכם הופך ללהקה. ביום אחד. בלי ניסיון קודם, בלי להכיר תווים, ועם להקה מקצועית שדואגת להכל.",
    metaDescription:
      "סדנת גיבוש מוזיקלית לצוותים: בוחרים להיט, כותבים אותו מחדש, עולים לבמה ולוקחים הביתה קליפ. בלי ניסיון קודם.",
    hero: {
      src: "/images/band-in-a-day-collage.png",
      alt: "כלי נגינה על רקע ירוק, סדנת Band in a Day",
      position: "50% 30%",
    },
    experience: {
      heading: "מה קורה בסדנה",
      paragraphs: workshop.bodyParagraphs,
      bulletsHeading: workshop.bulletsHeading,
      bullets: workshop.bullets,
      closing: workshop.closingBody,
    },
    extra: {
      name: "למה זה עובד",
      heading: workshop.secondaryBulletsHeading ?? "",
      bullets: workshop.secondaryBullets ?? [],
    },
    fits: {
      heading: "למי זה מתאים",
      text: "סדנאות ייעודיות לצוותים ולמנהלים, וגם פיק או סגירה חגיגית ליום גיבוש חברה.",
      chips: [
        "ימי גיבוש צוותיים",
        "אירועי הנהלה וסדנאות מנהלים",
        "ימי חברה",
      ],
    },
    faq: faq(1, 3, 5, 4, 6),
  },

  "trio-360": {
    slug: "trio-360",
    name: trioProduct.title,
    ctaTarget: "Trio 360",
    audience: "למשרדים, קבלות פנים ואירועים פרטיים",
    valueLine:
      "מופע טריו חי במעגל, שמביא את המוזיקה קרוב לקהל. אינטימי, אלגנטי ואנרגטי לכל הכיוונים, ואנחנו מגיעים עם כל ההגברה.",
    metaDescription:
      "Trio 360: מופע טריו חי במעגל שבו הקהל עוטף אותנו ומוזמן לשיר איתנו. למשרדים, קבלות פנים ואירועים פרטיים.",
    hero: {
      src: GALLERY_IMAGES[3].src,
      alt: "קהל סביב ההרכב של Rock Your People במופע",
      position: "50% 50%",
    },
    experience: {
      heading: "מה קורה במופע",
      paragraphs: [
        "מופעי 360 אינטימיים שבהם הקהל עוטף אותנו ומוזמן להשתלב בשירה.",
      ],
      bulletsHeading: "מה מקבלים",
      bullets: [
        "מוזיקה חיה קרוב לקהל: אינטימי, אלגנטי ואנרגטי בכל כיוון.",
        "הכל סגור מבחינתכם: אנחנו מגיעים עם כל ההגברה, כלי הנגינה ומערכות סאונד מתקדמות.",
        "מה שצריך מכם: חיבור לחשמל וקהל שבא ליהנות.",
      ],
    },
    fits: {
      heading: "למי זה מתאים",
      text: "משרדים, קבלות פנים, אירועים פרטיים, אירועי בוטיק וקוקטייל.",
      chips: [
        "משרדים",
        "קבלות פנים",
        "אירועים פרטיים",
        "אירועי בוטיק",
        "אירועי קוקטייל",
        "Happy Hour במשרד",
      ],
    },
    faq: faq(0, 5, 4, 6, 1),
  },

  "rock-your-dj": {
    slug: "rock-your-dj",
    name: dj.headline,
    ctaTarget: "Rock Your DJ",
    audience: "למסיבות ואירועי חברה שרוצים משהו מעבר לסטנדרט",
    valueLine:
      "הרחבה רוקדת, המוזיקה חיה. לקחנו מסיבת די ג'יי והכנסנו לתוכה גיטרה, בוזוקי וכלי הקשה חיים על הרחבה.",
    metaDescription:
      "Rock Your DJ: מסיבת די ג'יי עם גיטרה, בוזוקי וכלי הקשה חיים על הרחבה. לאירועי חברה, חתונות ומסיבות.",
    hero: {
      src: "/images/rock-your-dj-party.png",
      alt: "מסיבה עם די ג'יי ונגנים חיים על הרחבה",
      position: "50% 35%",
    },
    experience: {
      heading: "מה קורה במסיבה",
      paragraphs: dj.bodyParagraphs,
      bullets: dj.bullets,
    },
    extra: {
      name: beer.headline,
      product: "beer-office",
      heading: beer.headline,
      paragraphs: [beer.subheadline, ...beer.bodyParagraphs],
      bullets: beer.bullets,
      closing: beer.closingBody,
    },
    fits: {
      heading: "למי זה מתאים",
      text: dj.closingBody,
      chips: ["אירועי חברה", "חתונות", "מסיבות", "מסיבות סוף שנה"],
    },
    faq: faq(4, 5, 6, 0),
  },
};

export function getLandingContent(slug: string): LandingContent | null {
  return isLandingSlug(slug) ? LANDING_CONTENT[slug] : null;
}

export function landingTitle(content: LandingContent): string {
  return `${content.name} | Rock Your People`;
}
