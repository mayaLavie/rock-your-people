import {
  CONTACT_INSTAGRAM_URL,
  INSTAGRAM_DM_URL,
  WHATSAPP_CHAT_URL,
} from "@/lib/contact";

/** Hero title graphic — also used as navbar home logo */
export const TITLE_IMAGE = {
  src: "/images/final ryp pic.png",
  width: 1074,
  height: 1110,
  alt: "Rock Your People",
} as const;

export const HERO_TAGLINE_HE =
  "מופעים חיים ואינטראקטיביים, חוויות טריו חי ב-360°, וסדנאות מנהיגות מוסיקליות לחברות, צוותים ואירועים פרטיים.";

export const EXPERIENCES_SECTION_TAGLINE_HE =
  "לחצו על החוויה שמעניינת אתכם כדי לקבל עוד פרטים";

export const EXPERIENCES_SECTION_SUBTITLE_HE =
  "אנחנו מחברים אנשים דרך מוסיקה";

export const EXPERIENCES_SECTION_OFFERINGS_HE =
  "הופעות חיות  |  הופעות אינטרקטיביות | סדנאות";

export const EXPERIENCES_INTRO_PARAGRAPHS = [
  "המומחיות שלנו היא להפוך את הקהל שלכם ממשתתפים פסיביים לחלק בלתי נפרד מהמופע.",
] as const;

export const STORY_SECTION_PARAGRAPHS = [
  "Rock Your People נולד מתוך חיבור בין מוזיקה, קהילה וניסיון מקצועי של שנים על במות, באולפנים ובהפקות חיות.",
  "זה התחיל בקיבוץ, במפגשים מוזיקליים שהפכו עם הזמן להופעות קהילתיות גדולות — כאלה שבהן אנשים עם או בלי רקע מוזיקלי עלו לבמה והפכו לחלק מהרכב חי.",
  "מאחורי החוויה עומד צוות שיודע לבנות מופע באמת: הפקה מוזיקלית, עיבודים, סאונד, עבודה ווקאלית, ניהול במה והבנה עמוקה של קהל. ישי מוביל את ההפקה המוזיקלית והעיבודים, מאיה מביאה ניסיון של שנים כסאונדמנית בהופעות ואולפנים, ודור מביא את היכולת לקרוא קהל, לחבר אנשים ולהפוך השתתפות לחוויה טבעית ומשחררת.",
  "כולם יודעים מה כוחה של המוסיקה: היא שוברת מחסומים, בונה ביטחון, מחברת בין אנשים ויוצרת תחושת שייכות שנשארת הרבה אחרי שהאירוע נגמר.",
] as const;

export const ABOUT_NAV_LINK = {
  label: "About us",
  href: "#experience",
} as const;

/** Our experiences screen — starts where the hero video ends */
export const EXPERIENCES_NAV_LINK = {
  label: "Experiences",
  href: "#products",
} as const;

export const PRODUCT_NAV_LINKS = [
  { label: "Trio 360", href: "#trio-360" },
  { label: "Your People On Stage", href: "#your-people-on-stage" },
  { label: "Team Harmony", href: "#leadership-workshop" },
] as const;

export const NAV_LINKS = [
  { label: "Contact", href: "#contact" },
] as const;

/** Mobile hamburger menu */
export const MOBILE_MENU_LINKS = [
  ABOUT_NAV_LINK,
  ...PRODUCT_NAV_LINKS,
  { label: "גלריה", href: "#gallery" },
  { label: "יצירת קשר", href: "#contact" },
] as const;

export const SOCIAL_LINKS = {
  whatsapp: WHATSAPP_CHAT_URL,
  instagram: CONTACT_INSTAGRAM_URL,
  instagramDm: INSTAGRAM_DM_URL,
} as const;

export const PRODUCTS = [
  {
    id: "your-people-on-stage",
    title: "Your People On Stage",
    description:
      "A high-energy electric live show where the audience participates, influences, and becomes part of the performance.",
    bestFor:
      "Company events, conferences, festivals, large celebrations, team events.",
    variant: "stage" as const,
  },
  {
    id: "trio-360",
    title: "Trio 360",
    titleAccent: { primary: "Trio", secondary: "360" },
    description:
      "A live trio that brings music close to the audience — intimate, elegant, and energetic in every direction.",
    bestFor:
      "Offices, receptions, private events, boutique and cocktail events.",
    variant: "trio" as const,
  },
  {
    id: "musical-leadership-workshop",
    title: "Team Harmony",
    description:
      "Rhythm, listening, improvisation, and collaboration for stronger communication and leadership.",
    bestFor:
      "Management teams, leadership programs, team-building days, company workshops.",
    variant: "workshop" as const,
  },
] as const;

export const EXPERIENCES_CARD_HEADLINE_HE: Record<
  (typeof PRODUCTS)[number]["id"],
  string
> = {
  "trio-360": "מופע טריו במעגל",
  "your-people-on-stage": "",
  "musical-leadership-workshop": "סדנה מוסיקלית לאירגונים",
};

/** Replace with real paths under /public/images/ when assets are ready */
export const GALLERY_IMAGES = [
  { src: "/images/GALLERY_IMAGES/forGallery1.jpg", alt: "Gallery photo 1" },
  { src: "/images/GALLERY_IMAGES/galleryIshaiAndDor.jpeg", alt: "Gallery photo 2" },
  { src: "/images/GALLERY_IMAGES/appluse.jpeg", alt: "Gallery photo 3" },
  { src: "/images/GALLERY_IMAGES/longShotCroud.jpeg", alt: "Gallery photo 4" },
  { src: "/images/GALLERY_IMAGES/evyatar2.jpeg", alt: "Gallery photo 5" },
  { src: "/images/GALLERY_IMAGES/mayaOnKit.jpeg", alt: "Gallery photo 6" },
  {
    src: "/images/rock-your-people-in-office.jpeg",
    alt: "Rock Your People in the office",
  },
] as const;

/** 4th gallery image — used as Trio 360 product section background */
export const TRIO_360_SECTION_BG = GALLERY_IMAGES[3];
