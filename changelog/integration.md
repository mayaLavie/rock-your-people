# יומן שינויים: אינטגרציה

## מיזוג ארבעת הענפים (2026-11-16)

### מה השתנה
- מוזגו לענף `campaign-ready` לפי הסדר: `feat/measurement`, `feat/copy-cta`, `feat/landing-pages`, `feat/perf-seo`, כל אחד במיזוג `--no-ff`.
- לא נדרש פתרון התנגשויות ידני באף מיזוג.
- נבדק שכל נכס שדפי הנחיתה והאתר מפנים אליו קיים אחרי מחיקות הניקוי של ענף הביצועים.

### למה
- לאחד את כל העבודה לענף אחד מוכן לקמפיין, עם אימות מלא אחרי כל שלב.

### איך מחזירים
- קבצים: אין, מדובר במיזוגים.
- משתנה סביבה: אין.
- קומיט: `git revert -m 1 <מזהה מיזוג>`, כשמזהי המיזוג מופיעים ב-`git log --merges`.

## התאמת data-product לשם המוצר שהמבקר רואה (2026-11-16)

### מה השתנה
- הוסדר הכלל: ערך `data-product` נקבע לפי השם שמוצג למבקר, לא לפי מזהה ה-DOM הישן.
- הקטע עם המזהה `trio-360` מציג בפועל את הטקסט של Rock Your DJ, ולכן הוא מסומן `rock-your-dj`.
- הקטע `beer-office` מציג "בירה ונרימה" ומסומן בערך חדש, `beer-office`, שנוסף לרשימת המוצרים ולשמות העבריים. לבירה ונרימה אין דף נחיתה.
- כרטיסי המוצר בקרוסלה קיבלו `data-product` ו-`data-product-kind="card"`. כרטיסים אינם מפעילים אירוע ViewContent, כדי שגלישה בקרוסלה לא תייצר רעש.
- בדף `/lp/rock-your-dj` הבלוק של בירה ונרימה מסומן `beer-office`, ושורש הדף נשאר `rock-your-dj`.
- נוספו בדיקות בקובץ `tests/integration.spec.ts` שמוודאות את המיפוי משם גלוי לערך לכל קטע בדף הבית, ולכל כרטיס.
- קבצים: `lib/tracking/products.ts`, `lib/tracking/viewcontent.ts`, `components/ExperienceCarousel.tsx`, `components/landing/LandingSections.tsx`, `lib/landing-content.ts`, `tests/tracking.spec.ts`, `tests/integration.spec.ts`.

### למה
- אירועי ViewContent והודעת הוואטסאפ משתמשים בערך הזה, ושם שגוי היה מסתיר ביקוש אמיתי למוצר.

### איך מחזירים
- קבצים: אלה שמופיעים למעלה.
- משתנה סביבה: אין.
- קומיט: `git revert` של הקומיט "Align data-product with the visible product name" ביומן `git log`.

## טקסט עזר מדויק בטופס במצב form (2026-11-16)

### מה השתנה
- במצב `form` הטקסט מתחת לכפתור השליחה כבר לא טוען שאפשר לשלוח גם כששדות ריקים, כי במצב הזה שם וטלפון חובה.
- הטקסט החדש מסביר שממלאים שם וטלפון, שהפרטים נשמרים, ושבמקביל נפתחת שיחת וואטסאפ.
- הטקסט במצב `whatsapp` נשאר כמות שהוא, כי שם הקישור באמת נפתח גם בלי פרטים.
- קובץ: `components/ContactSection.tsx`.

### למה
- הטקסט הקודם סתר את הוולידציה של הטופס.

### איך מחזירים
- קבצים: `components/ContactSection.tsx`.
- משתנה סביבה: `NEXT_PUBLIC_LEAD_MODE` קובע איזה טקסט מוצג.
- קומיט: `git revert` של הקומיט "Give form-mode contact hint accurate Hebrew text".

## תמונת שיתוף ואיות אחיד (2026-11-16)

### מה השתנה
- הקובץ `public/og/og-default.jpg` נוצר מחדש עם הסלוגן "מחברים אנשים דרך מוזיקה", באותה שיטה ובאותו מראה: דף HTML עם גופני Rubik המקומיים, צילום ב-Chrome ללא ממשק, ושמירה כ-JPEG.
- הטקסט החלופי ב-`lib/seo.ts` ובשורה ביומן הביצועים עודכנו לאיות "מוזיקה".
- האיות הישן "מוסיקה" נשאר רק בטבלאות לפני ואחרי שביומן `changelog/copy-cta.md`, כי הן מתעדות את מה שהיה.

### למה
- האתר כולו עבר לאיות "מוזיקה", ותמונת השיתוף הציגה את האיות הישן.

### איך מחזירים
- קבצים: `public/og/og-default.jpg`, `lib/seo.ts`, `changelog/perf-seo.md`.
- משתנה סביבה: אין.
- קומיט: `git revert` של הקומיט "Regenerate default OG image".

## מזהי קומיט, מקליט רשת ודוח רשת (2026-11-16)

### מה השתנה
- הוחלפו מזהי הקומיט הזמניים ביומני `measurement.md`, `copy-cta.md` ו-`perf-seo.md` במזהים האמיתיים של ענפי העבודה.
- נוסף מקליט רשת לבדיקות: הוא פעיל רק כשמשתנה הסביבה `NETWORK_DUMP_DIR` מוגדר, וכותב קובץ JSON לכל בדיקה (`tests/fixtures.ts`).
- נוסף הסקריפט `scripts/network-report.mjs` שהופך את הקבצים האלה לדוח Markdown עם בדיקות אוטומטיות: דבר לא נשלח לפני הסכמה, כל אירוע נשלח פעם אחת, מזהי אירוע זהים בדפדפן ובשרת, פרמטרי utm ו-fbclid נשמרים, וטלפון מגיע לשרת של Meta מגובב.
- נוסף ניסיון חוזר לבדיקת ההרשמה לשיר, שנכשלה לסירוגין כשהמערכת עמוסה, כי חלון השיר נפתח מעט אחרי שהכפתור מופיע.

### למה
- להוכיח את תקינות המדידה בראיות, ולצמצם בדיקות לא יציבות.

### איך מחזירים
- קבצים: `tests/fixtures.ts`, `scripts/network-report.mjs`, `tests/tracking.spec.ts`, `changelog/*.md`.
- משתנה סביבה: `NETWORK_DUMP_DIR`.
- קומיט: `git revert` של הקומיטים בשמות "Add network recorder fixture..." ו-"Harden song-signup e2e...".

## איך מריצים את דוח הרשת
- הפעלת הבדיקות עם הקלטה: `NETWORK_DUMP_DIR=<תיקייה> npx playwright test tests/tracking.spec.ts`.
- יצירת הדוח: `node scripts/network-report.mjs <תיקייה> <קובץ.md>`.
