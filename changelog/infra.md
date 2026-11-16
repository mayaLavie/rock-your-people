# יומן שינויים של תשתית

## תשתית בדיקות: Playwright, מדמה פיקסל של Meta וסקריפט צילומי מסך (2026-11-16)

### מה השתנה
- נוספה חבילת `@playwright/test` כתלות פיתוח, עם הקובץ `playwright.config.ts` ושני פרויקטים: נייד (390x844, פי 2, מגע) ודסקטופ (1440x900).
- הדפדפן הוא Chrome של המערכת ב-`/usr/bin/google-chrome`, או הנתיב שהוגדר במשתנה הסביבה `PLAYWRIGHT_CHROMIUM_PATH`.
- נוסף הקובץ `tests/helpers/meta-network.ts` שחוסם כל בקשה אל `facebook.com` ו-`facebook.net` ומחזיר תשובה מקומית.
- נוסף הקובץ `tests/helpers/fbevents-stub.js` שמחקה את `fbevents.js` ומתרגם קריאות `fbq('track', ...)` לבקשות GET אל `/tr/` כמו הפיקסל האמיתי.
- נוסף הקובץ `tests/fixtures.ts` שמתקין את החסימה אוטומטית לפני כל ניווט.
- נוסף הקובץ `tests/baseline.spec.ts`: בדיקה שאין בקשות לפייסבוק לפני אישור עוגיות, ושאירוע PageView נשלח פעם אחת בדיוק אחרי האישור.
- נוסף הסקריפט `scripts/screenshots.mjs` שמצלם מסך עליון ומסך מלא, עם באנר העוגיות ובלעדיו, בנייד ובדסקטופ, ועם דגל `--sections` לצילומי אזורים.
- נוסף הסקריפט `scripts/verify.mjs` שמריץ lint, build ובדיקות, ומדווח על lint בלי להפסיק עליו.
- נוספו הפקודות `test:e2e`, `screenshots` ו-`verify` ב-`package.json`.
- הקובץ `.gitignore` הורחב עם `test-results` ו-`playwright-report`.

### למה
- הצוות צריך דרך אוטומטית לוודא שהפיקסל והסכמה לעוגיות מתנהגים נכון, בלי לשלוח אף בקשה אמיתית לפייסבוק מתוך הבדיקות.
- הצוות צריך צילומי מסך עקביים של האתר לפני ואחרי כל שינוי, להשוואה חזותית.

### איך מחזירים
- קבצים להסרה: `playwright.config.ts`, התיקייה `tests/`, `scripts/screenshots.mjs`, `scripts/verify.mjs`, והשורות שנוספו ל-`.gitignore`.
- קבצים לעדכון: `package.json` (הסרת הפקודות והתלות `@playwright/test`) ו-`package-lock.json`.
- משתנה סביבה: אין שינוי שתלוי בדגל, והמשתנים `PLAYWRIGHT_CHROMIUM_PATH`, `BASE_URL` ו-`E2E_PORT` משמשים את הבדיקות בלבד.
- קומיט: `git revert 836d1c2`.

## מעבר לגופנים מקומיים כדי שהבנייה תעבוד בלי רשת (2026-11-16)

### מה השתנה
- הקובץ `app/layout.tsx` עבר מ-`next/font/google` אל `next/font/local` עבור Rubik, Varela Round, Bowlby One SC, Bebas Neue ו-Inter.
- נוספה התיקייה `app/fonts/` עם קבצי woff2 שהועתקו מחבילות `@fontsource`, והקובץ `OFL-NOTE.txt` עם הערת הרישיון.
- שמות משתני ה-CSS נשארו זהים: `--font-bowlby`, `--font-inter`, `--font-bebas`, `--font-rubik`, `--font-varela`.
- הגופנים Rubik ו-Varela Round נטענים כשתי פנים (עברית ולטינית) עם `unicode-range`, ומשולבים למשתנה אחד על תגית `body`.
- הגופנים Rubik ו-Inter הם גופנים משתנים, ולכן משקלים 400 עד 700 מוצגים בדיוק כמו קודם.

### למה
- הפקודה `npm run build` נכשלה בסביבה בלי גישה אל Google Fonts.
- אחסון הגופנים בתוך המאגר מבטל תלות ברשת בזמן בנייה, ומבטל גם בקשה חיצונית של הדפדפן אל גוגל.

### איך מחזירים
- קבצים: `app/layout.tsx` ואת התיקייה `app/fonts/`.
- משתנה סביבה: אין.
- קומיט: `git revert ad9b61d`, ולאחר מכן הבנייה תדרוש גישה אל Google Fonts.
