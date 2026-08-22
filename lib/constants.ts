import {
  CONTACT_INSTAGRAM_URL,
  INSTAGRAM_DM_URL,
  WHATSAPP_CHAT_URL,
} from "@/lib/contact";

/** Apps Script web app that appends song sign-ups to a Google Sheet */
export const SONG_SIGNUP_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxJExnExbawXbVHbHc7F7CaYdvQfod8uRZU1m1eixruR39XiDKfMguP52EQubFWQ2Yfpw/exec";

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

export const EXPERIENCES_SECTION_TITLE_HE =
  "המומחיות שלנו היא להפוך את הקהל שלכם לרוקסטארז לערב אחד";

export const EXPERIENCES_SECTION_DESCRIPTION_HE =
  "נוצר במיוחד עבור חברות, ארגונים וקהילות שמחפשים פעילות מקורית,\nבלתי נשכחת, שוברת מחסומים ומגבשת.";

export const EXPERIENCES_SECTION_SCHEDULE_INTRO_HE =
  'החוויות והסדנאות שלנו תפורות ומותאמות אישית לכל לו"ז או צורך לאורך השנה:';

export const EXPERIENCES_SECTION_USE_CASES = [
  "ימי חברה וערבי חברה",
  "ימי גיבוש צוותיים",
  "Happy Hour במשרד",
  "חגים והרמות כוסית",
  "מסיבות סוף שנה",
  "אירועי הנהלה וסדנאות מנהלים",
  "אירועים פרטיים וקהילתיים",
] as const;

export const EXPERIENCES_SECTION_SUBTITLE_HE =
  "אנחנו מחברים אנשים דרך מוסיקה";

export const EXPERIENCES_SECTION_OFFERINGS_HE =
  "הופעות חיות  |  הופעות אינטרקטיביות | סדנאות";

export const EXPERIENCES_INTRO_PARAGRAPHS = [
  "מחברים אנשים דרך מוסיקה",
] as const;

export const EXPERIENCES_INTRO_STAGE_IMAGE = {
  src: "/images/evyatar stage.jpeg",
  width: 1079,
  height: 812,
  alt: "אביתר על הבמה",
} as const;

export const STORY_SECTION_PARAGRAPHS = [
  "Rock Your People נולד מתוך חיבור בין מוזיקה, קהילה וניסיון מקצועי של שנים על במות, באולפנים ובהפקות חיות.",
  "זה התחיל בקיבוץ, במפגשים מוזיקליים שהפכו עם הזמן להופעות קהילתיות גדולות — כאלה שבהן אנשים עם או בלי רקע מוזיקלי עלו לבמה והפכו לחלק מהרכב חי.",
  "מאחורי החוויה עומד צוות שיודע לבנות מופע באמת: הפקה מוזיקלית, עיבודים, סאונד, עבודה ווקאלית, ניהול במה והבנה עמוקה של קהל. ישי מוביל את ההפקה המוזיקלית והעיבודים, מאיה מביאה ניסיון של שנים כסאונדמנית בהופעות ואולפנים, ודור מביא את היכולת לקרוא קהל, לחבר אנשים ולהפוך השתתפות לחוויה טבעית ומשחררת.",
  "כולם יודעים מה כוחה של המוסיקה: היא שוברת מחסומים, בונה ביטחון, מחברת בין אנשים ויוצרת תחושת שייכות שנשארת הרבה אחרי שהאירוע נגמר.",
] as const;

export const FAQ_ITEMS = [
  {
    question: "מה זה בעצם Rock Your People? אתם להקה או סדנה?",
    answer:
      "אנחנו להקה מקצועית שיוצרת חוויות משתפות. אצלנו הקהל הוא חלק בלתי נפרד מהמופע, ועולה איתנו לשיר, לנגן ולהיות רוקסטארס לערב אחד.\n\nהסל שלנו כולל מופעי 360 אינטימיים (Trio 360) שבהם הקהל עוטף אותנו ומוזמן להשתלב בשירה, מופעים חשמליים גדולים יותר (Your People On Stage) שבהם האנשים שלכם הם הכוכבים על הבמה, עם הכנה וליווי מקדים, כולל חזרה מקצועית, או ללא. תלוי בפורמט ובצורך שלכם. בנוסף, אנחנו עורכים סדנאות מוסיקה מעשיות לצוותים ומנהלים (Team Harmony).\n\nמחפשים פשוט הופעה מעולה? אנחנו מגיעים גם להופעות חיות קלאסיות, אנרגטיות וסוחפות שלנו, ללא שילוב קהל. אתם בוחרים את הפורמט שמתאים לכם.",
  },
  {
    question: "צריך ניסיון מוזיקלי כדי להשתתף?",
    answer:
      "ממש לא. החוויות שלנו מונגשות בגובה העיניים ובנויות בצורה הדרגתית, זורמת ומזמינה. אנחנו מייצרים מרחב בטוח ומשוחרר שבו כולם מרגישים בנוח, והניסיון שלנו מוכיח שברגע שהתווים הראשונים מתחילים הקהל פשוט נכנס לקצב באופן טבעי.",
  },
  {
    question: "כמה משתתפים יכולים לעלות לבמה במופע המשותף?",
    answer:
      "כמה שתרצו, מבודדים ועד עשרות. לאורך המופע אנחנו משלבים את האנשים שלכם ומעלים אותם לבמה כיחידים, זוגות או אפילו שלישיות. שרים, מנגנים או פשוט רוקדים ומרימים את האנרגיה.",
  },
  {
    question: "האם הפעילות מתאימה ליום גיבוש?",
    answer:
      "לגמרי, זה מתאים בול. הפעילות מושלמת כפיק או כסגירה חגיגית ליום גיבוש חברה. בנוסף, אנחנו מעבירים סדנאות ייעודיות לצוותים ומנהלים (Team Harmony), שבהן נחשפים למוסיקה בצורה אקטיבית, ובעזרת תקשורת גבוהה ושיתוף פעולה, יוצאים בסוף הסדנה עם יצירה מוסיקלית מקורית שכולם לקחו בה חלק.",
  },
  {
    question: "לאילו סוגי אירועים אתם מתאימים והאם אתם מגיעים לכל הארץ?",
    answer:
      "אנחנו מגיעים לכל מקום בארץ! הפעילויות שלנו מותאמות אישית ומשתלבות מעולה בערבי חברה, Happy Hour, חגים, אירועים פרטיים ואירועים קהילתיים.",
  },
  {
    question: "מה צריך לספק לכם במקום?",
    answer:
      "מעבר להיותנו מוזיקאים, אנחנו גם אנשי סאונד והגברה ולכן יודעים להביא איתנו את כל מעטפת ההפקה: כלי נגינה, הגברה ומערכות סאונד מתקדמות. יותר מזה, במופעי הטריו (Trio 360) אנחנו מגיעים עם כל ההגברה איתנו, כך שמבחינתכם הכל סגור. אתם רק צריכים לספק לנו חיבור לחשמל וקהל שבא ליהנות.",
  },
  {
    question: "נשמע מעולה, איך מתקדמים וסוגרים איתכם אירוע?",
    answer:
      "הכי פשוט שיש. משאירים פרטים כאן באתר או שולחים לנו הודעה קצרה. נבין יחד מה אופי האירוע, מי הקהל שלכם ומה המטרה, ונתאים לכם את הפורמט המוזיקלי המדויק שיחבר, ישמח ויעשה המון אנרגיה טובה לאנשים שלכם.",
  },
] as const;

export const ABOUT_NAV_LINK = {
  label: "About Us",
  href: "#experience",
} as const;

/** Our experiences screen — starts where the hero video ends */
export const EXPERIENCES_NAV_LINK = {
  label: "Experiences",
  href: "#products",
} as const;

export const FAQ_NAV_LINK = {
  label: "FAQ",
  href: "#faq",
} as const;

export const GALLERY_NAV_LINK = {
  label: "Gallery",
  href: "#gallery",
} as const;

export const CONTACT_NAV_LINK = {
  label: "Contact",
  href: "#contact",
} as const;

export const PRODUCT_NAV_LINKS = [
  { label: "Trio 360", href: "#trio-360" },
  { label: "Your People On Stage", href: "#your-people-on-stage" },
  { label: "Team Harmony", href: "#leadership-workshop" },
] as const;

export const NAV_LINKS = [CONTACT_NAV_LINK] as const;

export const DESKTOP_NAV_LINKS = [
  FAQ_NAV_LINK,
  GALLERY_NAV_LINK,
  CONTACT_NAV_LINK,
] as const;

/** Mobile hamburger menu */
export const MOBILE_MENU_LINKS = [
  ...PRODUCT_NAV_LINKS,
  { label: "מי אנחנו", href: ABOUT_NAV_LINK.href },
  { label: "שאלות נפוצות", href: FAQ_NAV_LINK.href },
  { label: "גלריה", href: GALLERY_NAV_LINK.href },
  { label: "צרו קשר", href: CONTACT_NAV_LINK.href },
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
  "musical-leadership-workshop": "סדנה מוזיקלית לצוותים ומנהלים",
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

export type GalleryStoryItem = {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Frame shown while a video loads */
  poster?: string;
  /**
   * "contain" shows landscape media whole instead of cropping it to the
   * portrait frame. The empty space fills with a blurred copy of the image.
   */
  fit?: "cover" | "contain";
};

/**
 * Story-style gallery, played in this order.
 * Add photos and videos here — files live under /public/images/.
 */
export const GALLERY_STORY_ITEMS: readonly GalleryStoryItem[] = [
  {
    type: "image",
    src: "/images/GALLERY_IMAGES/forGallery1.jpg",
    alt: "Gallery photo 1",
    fit: "contain",
  },
  {
    type: "image",
    src: "/images/GALLERY_IMAGES/galleryIshaiAndDor.jpeg",
    alt: "Gallery photo 2",
  },
  {
    type: "video",
    src: "/images/GALLERY_IMAGES/ishai solo.mp4",
    alt: "ישי סולו",
  },
  {
    type: "image",
    src: "/images/GALLERY_IMAGES/appluse.jpeg",
    alt: "Gallery photo 3",
    fit: "contain",
  },
  {
    type: "video",
    src: "/images/GALLERY_IMAGES/Tal.mp4",
    alt: "טל על הבמה",
  },
  {
    type: "image",
    src: "/images/GALLERY_IMAGES/evyatar2.jpeg",
    alt: "Gallery photo 5",
    fit: "contain",
  },
  {
    type: "video",
    src: "/images/GALLERY_IMAGES/miri at shapes.mp4",
    alt: "מירי ב-Shapes",
  },
  {
    type: "image",
    src: "/images/GALLERY_IMAGES/mayaOnKit.jpeg",
    alt: "Gallery photo 6",
  },
  {
    type: "video",
    src: "/images/beatles.mp4",
    alt: "מחרוזת ביטלס",
  },
  {
    type: "image",
    src: "/images/rock-your-people-in-office.jpeg",
    alt: "Rock Your People in the office",
  },
];
