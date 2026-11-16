import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { LegalPageHeader } from "@/components/LegalPageHeader";
import {
  CONTACT_INSTAGRAM_HANDLE,
  CONTACT_WHATSAPP_PHONE,
} from "@/lib/contact";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "הצהרת נגישות | Rock Your People",
  description:
    "הצהרת הנגישות של אתר Rock Your People: התאמות הנגישות באתר, מגבלות ידועות ופרטי יצירת קשר לפניות בנושא נגישות",
};

const headingClass = "mt-10 font-hebrew text-xl font-semibold text-cream";
const paragraphClass = "mt-3 font-hebrew leading-relaxed text-cream";
const listClass =
  "mt-3 list-disc space-y-2 pr-6 font-hebrew leading-relaxed text-cream";
const linkClass = "underline underline-offset-2 hover:text-white";

/** 972524632111 -> 052-463-2111 */
const WHATSAPP_PHONE_DISPLAY = `0${CONTACT_WHATSAPP_PHONE.slice(3, 5)}-${CONTACT_WHATSAPP_PHONE.slice(5, 8)}-${CONTACT_WHATSAPP_PHONE.slice(8)}`;

export default function AccessibilityPage() {
  return (
    <>
      <LegalPageHeader />
      <main lang="he" dir="rtl" className="px-4 py-8 sm:px-6 sm:py-12">
        {/* Dark panel: cream on #1e1c1c is well above 4.5:1, unlike cream on the brand pink */}
        <div className="mx-auto max-w-3xl rounded-[5px] bg-[#1e1c1c] px-5 pb-10 pt-4 sm:px-10">
          <h1 className="mt-6 font-hebrew text-3xl font-semibold text-cream sm:text-4xl">
            הצהרת נגישות
          </h1>
          <p className="mt-3 font-hebrew text-sm text-cream/90">
            עודכן לאחרונה: 16 בנובמבר 2026
          </p>

          <p className={paragraphClass}>
            אנחנו, להקת Rock Your People, רוצים שכל אדם יוכל להכיר את האתר שלנו
            ולפנות אלינו, כולל אנשים עם מוגבלות. אנחנו פועלים כדי להנגיש את האתר
            rockyourpeople.com בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות
            ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות),
            התשע&quot;ג-2013.
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
            <li>האתר רספונסיבי ומותאם לטלפון נייד, לטאבלט ולמחשב.</li>
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
              אנימציות, מעברים ותנועה באתר מצומצמים או מושבתים למי שהגדיר במכשיר
              העדפה להפחתת תנועה.
            </li>
            <li>
              תמונות שמעבירות תוכן כוללות טקסט חלופי, ותמונות קישוט מסומנות כך
              שיידלגו עליהן.
            </li>
            <li>
              הודעת העוגיות מאפשרת לבחור אם להפעיל מדידה, והבחירה ניתנת לשינוי
              בכל עת מתחתית האתר.
            </li>
          </ul>

          <h2 className={headingClass}>מגבלות ידועות</h2>
          <ul className={listClass}>
            <li>
              ההמלצות באתר מוצגות כתמונות, ולא כטקסט. אנחנו עובדים על הוספת
              תיאור טקסטואלי להן.
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
            לשאלות, לבקשות להתאמה ולדיווח על בעיית נגישות אפשר לפנות לרכז
            הנגישות שלנו.
          </p>
          <ul className={listClass}>
            <li>רכז/ת הנגישות: צוות האתר של Rock Your People</li>
            <li>
              וואטסאפ:{" "}
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                dir="ltr"
              >
                {WHATSAPP_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              אינסטגרם:{" "}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                dir="ltr"
              >
                @{CONTACT_INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
          <p className={paragraphClass}>
            פניות נגישות מתקבלות בוואטסאפ ובאינסטגרם.
          </p>
          <p className={paragraphClass}>
            בפנייה כדאי לציין את כתובת הדף, את הבעיה שנתקלתם בה ואת הדפדפן
            והמכשיר שבהם השתמשתם.
          </p>
        </div>
      </main>
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
