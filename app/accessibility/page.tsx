import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { CONTACT_INSTAGRAM_HANDLE } from "@/lib/contact";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "הצהרת נגישות | Rock Your People",
  description:
    "הצהרת הנגישות של אתר Rock Your People: התאמות הנגישות באתר, מגבלות ידועות ופרטי יצירת קשר לפניות בנושא נגישות",
};

const headingClass = "mt-10 font-hebrew text-xl font-semibold text-cream";
const paragraphClass = "mt-3 font-hebrew leading-relaxed text-cream/85";
const listClass =
  "mt-3 list-disc space-y-2 pr-6 font-hebrew leading-relaxed text-cream/85";
const linkClass = "underline underline-offset-2 hover:text-cream";
/** Marks text the band must replace before the page is final */
const placeholderClass = "rounded bg-cream/15 px-1.5 py-0.5 font-semibold text-cream";

export default function AccessibilityPage() {
  return (
    <>
      <main
        lang="he"
        dir="rtl"
        className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 sm:py-24"
      >
        <Link href="/" className={`font-hebrew text-sm ${linkClass}`}>
          חזרה לאתר
        </Link>

        <h1 className="mt-8 font-hebrew text-3xl font-semibold text-cream sm:text-4xl">
          הצהרת נגישות
        </h1>
        <p className="mt-3 font-hebrew text-sm text-cream/60">
          עודכן לאחרונה: <span className={placeholderClass}>[למילוי: תאריך עדכון]</span>
        </p>

        <p className={paragraphClass}>
          ב-Rock Your People אנחנו רוצים שכל אדם יוכל להכיר את האתר שלנו
          ולפנות אלינו, כולל אנשים עם מוגבלות. אנחנו פועלים כדי להנגיש את האתר
          rockyourpeople.com בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ולתקנות
          שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע&quot;ג-2013.
        </p>

        <h2 className={headingClass}>התקן שאליו אנחנו מכוונים</h2>
        <p className={paragraphClass}>
          האתר נבנה בשאיפה לעמוד בדרישות תקן ישראלי ת&quot;י 5568, שמבוסס על
          הנחיות WCAG 2.0 ברמה AA. עדיין לא עשינו ביקורת נגישות מקצועית מלאה,
          ולכן איננו מצהירים שהאתר עומד בתקן בכל חלקיו.
        </p>

        <h2 className={headingClass}>התאמות הנגישות שקיימות באתר</h2>
        <ul className={listClass}>
          <li>
            התוכן בעברית מסומן כעברית וכמוצג מימין לשמאל, כדי שקוראי מסך
            ודפדפנים יציגו ויקריאו אותו נכון.
          </li>
          <li>
            האתר רספונסיבי ומותאם לטלפון נייד, לטאבלט ולמחשב.
          </li>
          <li>
            שדות טופס יצירת הקשר מסומנים בתוויות טקסט גלויות שמקושרות לשדה.
          </li>
          <li>
            שאלות נפוצות נפתחות ונסגרות בכפתורים שאפשר להפעיל במקלדת, והמצב
            שלהם (פתוח או סגור) מוצג לטכנולוגיות מסייעות.
          </li>
          <li>
            לכפתורים של קרוסלת החוויות יש שמות נגישים בעברית, ותיבת ההמלצות
            נעצרת ומתחדשת גם בלחיצה על Enter או על רווח.
          </li>
          <li>
            תפריט הנייד וחלון ההרשמה לשירה במופע נסגרים בלחיצה על Escape.
          </li>
          <li>
            אנימציות, מעברים ותנועה באתר מצומצמים או מושבתים למי שהגדיר
            במכשיר העדפה להפחתת תנועה.
          </li>
          <li>
            תמונות שמעבירות תוכן כוללות טקסט חלופי, ותמונות קישוט מסומנות כך
            שיידלגו עליהן.
          </li>
          <li>
            הודעת העוגיות מאפשרת לבחור אם להפעיל מדידה, והבחירה ניתנת לשינוי בכל
            עת מתחתית האתר.
          </li>
        </ul>

        <h2 className={headingClass}>מגבלות ידועות</h2>
        <ul className={listClass}>
          <li>
            ההמלצות באתר מוצגות כתמונות, ולא כטקסט. אנחנו עובדים על הוספת תיאור
            טקסטואלי להן.
          </li>
          <li>
            חלק מהסרטונים בגלריה ובראש האתר עשויים להיות ללא כתוביות או תיאור
            קולי.
          </li>
          <li>
            ייתכן שחלק מהאלמנטים, כמו הגלריה וקרוסלת החוויות, לא נוחים לשימוש
            במקלדת או בקורא מסך כמו שהיינו רוצים.
          </li>
        </ul>
        <p className={paragraphClass}>
          אם נתקלתם בקושי, נשמח שתספרו לנו כדי שנוכל לתקן, ובינתיים נשמח לתת
          את המידע או השירות בדרך אחרת.
        </p>

        <h2 className={headingClass}>רכז הנגישות ופניות בנושא</h2>
        <p className={paragraphClass}>
          לשאלות, לבקשות להתאמה ולדיווח על בעיית נגישות אפשר לפנות לרכז הנגישות
          שלנו.
        </p>
        <ul className={listClass}>
          <li>
            שם רכז/ת הנגישות:{" "}
            <span className={placeholderClass}>[למילוי: שם רכז/ת הנגישות]</span>
          </li>
          <li>
            טלפון: <span className={placeholderClass}>[למילוי: טלפון]</span>
          </li>
          <li>
            אימייל: <span className={placeholderClass}>[למילוי: אימייל]</span>
          </li>
          <li>
            אפשר גם ב
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              וואטסאפ
            </a>{" "}
            או באינסטגרם{" "}
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              dir="ltr"
            >
              @{CONTACT_INSTAGRAM_HANDLE}
            </a>
            .
          </li>
        </ul>
        <p className={paragraphClass}>
          בפנייה כדאי לציין את כתובת הדף, את הבעיה שנתקלתם בה ואת הדפדפן
          והמכשיר שבהם השתמשתם.
        </p>
      </main>
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
