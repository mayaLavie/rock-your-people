# יומן שינויים: מהירות, שיתוף וניקיון קוד

## אופטימיזציית מדיה, מטא-דאטה, שיתוף וניקיון lint (2026-11-16)

### מה השתנה
- דחיסת סרטונים: כל קבצי ה-mp4 בתיקיית public קודדו מחדש ב-H.264 עם faststart, שמות הקבצים נשארו זהים. סרטון הרקע של הדף הראשי הוקטן לרוחב 432 פיקסלים ללא אודיו, כי הוא מוסתר מתחת לשכבת מגנטה.
- דחיסת תמונות: קובצי jpg הוקטנו לצלע ארוכה של עד 2400 פיקסלים באיכות 80, וקובצי png גדולים עברו לפלטה של 256 צבעים (נבדקו ויזואלית). השמות נשארו זהים.
- קובץ favicon.svg הכיל תמונת raster מוטמעת פעמיים, והיא הוקטנה (מראה זהה, ירידה מ-496KB ל-63KB).
- מחיקת קבצים שלא בשימוש (הוכח בחיפוש בקוד, ב-css ובקבצי md): next.svg, vercel.svg, file.svg, globe.svg, window.svg, כפילות של תמונת המשרד בשם עם רווחים, ChatGPT Image, Make Background Transparent (4), Screenshot RYP, Screenshot trio 360, canve pic2.
- קבצי band-in-a-day, workshop, band-transparent ו-rock-your-people-title-transparent לא נמחקו, כי דפי הנחיתה שנבנים במקביל עשויים להשתמש בהם. הם רק נדחסו.
- שפת המסמך: הוגדר lang="he" באלמנט html בקובץ app/layout.tsx.
- מטא-דאטה: נוספו metadataBase (ממשתנה הסביבה NEXT_PUBLIC_SITE_URL), תבנית כותרת, תיאור, openGraph, twitter וצבע ערכת נושא (viewport). כתובת canonical ו-og:url מוגדרות רק בדף הבית (app/page.tsx), כדי שדפים אחרים לא יצביעו בטעות על הבית. הכותרת של דף הפרטיות קוצרה כדי שהתבנית לא תכפיל את שם האתר.
- תמונת שיתוף: הקובץ public/og/og-default.jpg בגודל 1200 על 630 (כ-48KB) עם הסלוגן "מחברים אנשים דרך מוזיקה".
- נוספו app/sitemap.ts, app/robots.ts (חסימת api), הקובץ lib/seo.ts והרכיב components/JsonLd.tsx (PerformingGroup עם Instagram ואיש קשר בוואטסאפ, רק עובדות מהקוד).
- ביצועים: הוסרה העדפת priority מתמונת הגלריה הראשונה (היא מתחת לקפל), וסרטוני הגלריה עברו ל-preload="none" כדי שלא יורדו לפני הפעלה וכדי שה-poster יוצג.
- lint: תוקנו שגיאות ב-ExperienceCarousel (ref בזמן רינדור ו-setState סינכרוני ב-effect), ב-MobileMenu (שימוש ב-useSyncExternalStore במקום setState ב-effect), הוסר DetailContent שלא בשימוש, והוספה הערת השבתה ל-tests/fixtures.ts עבור הפונקציה use של Playwright.
- בדיקות: נוסף tests/perf-seo.spec.ts.

### מדידות
| מדד | לפני | אחרי |
|---|---|---|
| גודל תיקיית public | 162MB | 69MB |
| העברת רשת בטעינת דף הבית (Lighthouse מובייל) | 3,483KiB | 1,591KiB |
| ציון ביצועים (Lighthouse מובייל) | 0.58 | 0.70 |
| LCP | 12.9 שניות | 7.2 שניות |
| TBT | 450ms | 100ms |
| CLS | 0 | 0 |

- דוחות JSON שמורים בתיקייה shots/perf. אלמנט ה-LCP הוא תמונת החמור בחלון ההרשמה, שנטען מצד הלקוח (קובץ SongSignupPopup שייך לסוכן אחר).

### למה
- הקמפיין מכוון לתנועת מובייל ממודעות Meta, ולכן משקל הדף ותצוגות מקדימות של קישורים משפיעים ישירות על ההמרה.

### החלטה על dir
- לא נוסף dir="rtl" לאלמנט html. בדיקת צילומי מסך הראתה שינוי ב-29% עד 44% מהפיקסלים, כי האתר מגדיר כיוון בכל בלוק בנפרד.

### איך מחזירים
- קבצים: כל הנתיבים שמופיעים למעלה, בעיקר app/layout.tsx, app/page.tsx, app/privacy/page.tsx, app/sitemap.ts, app/robots.ts, lib/seo.ts, components/JsonLd.tsx, components/GalleryStory.tsx, components/MobileMenu.tsx, components/ExperienceCarousel.tsx, components/ProductDetailSection.tsx, public/**.
- משתנה סביבה: NEXT_PUBLIC_SITE_URL קובע את כתובת האתר, וברירת המחדל היא https://rockyourpeople.com.
- שחזור קובץ שנמחק או נדחס: `git checkout 595d94a -- "<נתיב הקובץ>"`.
- קומיט: `git revert <hash>` של הקומיט שמופיע ביומן ה-git בענף feat/perf-seo.
