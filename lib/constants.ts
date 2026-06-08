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

export const STORY_SECTION_PARAGRAPHS = [
  "Rock Your People נולד מתוך רגעים פשוטים של מוזיקה, חברים וקהילה.",
  "התחלנו כחברים שנפגשים לנגן יחד בקיבוץ — מפגשים קטנים, לא רשמיים, שהפכו לאט לאט להופעות קהילתיות ולאירועים הכי מדוברים בשבילים. אל הבמה הצטרפו אנשים עם רקע מוסיקלי, וגם כאלה שלא עמדו על במה מעולם.",
  "עם הזמן זה הפך למסורת: מופעים מוסיקליים שבהם הקהילה לא רק צופה, אלא משתתפת, יוצרת, מתרגשת ומופיעה יחד.",
  "שם הבנו את הכוח האמיתי של הדבר הזה.",
  "ראינו איך מוזיקה מחברת אנשים, בונה ביטחון, פותחת מקום חדש לביטוי, גורמת לאנשים לעבוד יחד, להקשיב, להעז, לפתח רעיונות ולהרגיש חלק ממשהו גדול יותר.",
  "יצרנו שלושה פורמטים שונים — מופע מחשמל שבו הכוכבים על הבמה הם בכלל הקהל, מופע טריו 360, הופעה מרימה במעגל וסדנת מנהלים מוסיקלית — כדי להביא את אותה אנרגיה מחברת, משמחת ומעצימה גם לחברות, צוותים, קהילות ואירועים פרטיים.",
] as const;

export const ABOUT_NAV_LINK = {
  label: "About us",
  href: "#experience",
} as const;

export const PRODUCT_NAV_LINKS = [
  { label: "Trio 360", href: "#trio-360" },
  { label: "Your People On Stage", href: "#your-people-on-stage" },
  { label: "Team Harmony", href: "#leadership-workshop" },
] as const;

export const NAV_LINKS = [
  { label: "Videos", href: "#videos" },
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
  youtube: "https://youtube.com/@rockyourpeople",
  instagram: CONTACT_INSTAGRAM_URL,
  instagramDm: INSTAGRAM_DM_URL,
} as const;

export const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/vp0S4VDX6rY?rel=0&modestbranding=1";

export const PRODUCTS = [
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
    id: "your-people-on-stage",
    title: "Your People On Stage",
    description:
      "A high-energy electric live show where the audience participates, influences, and becomes part of the performance.",
    bestFor:
      "Company events, conferences, festivals, large celebrations, team events.",
    variant: "stage" as const,
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

/** Replace with real paths under /public/images/ when assets are ready */
export const GALLERY_IMAGES = [
  { src: "/images/GALLERY_IMAGES/forGallery1.jpg", alt: "Gallery photo 1" },
  { src: "/images/GALLERY_IMAGES/galleryIshaiAndDor.jpeg", alt: "Gallery photo 2" },
  { src: "/images/GALLERY_IMAGES/appluse.jpeg", alt: "Gallery photo 3" },
  { src: "/images/GALLERY_IMAGES/longShotCroud.jpeg", alt: "Gallery photo 4" },
  { src: "/images/GALLERY_IMAGES/evyatar2.jpeg", alt: "Gallery photo 5" },
  { src: "/images/GALLERY_IMAGES/mayaOnKit.jpeg", alt: "Gallery photo 6" },
] as const;
