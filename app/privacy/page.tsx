import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { CONTACT_INSTAGRAM_HANDLE } from "@/lib/contact";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | Rock Your People",
  description: "איך Rock Your People משתמשת במידע ובעוגיות באתר",
};

const headingClass = "mt-10 font-hebrew text-xl font-semibold text-cream";
const paragraphClass = "mt-3 font-hebrew leading-relaxed text-cream/85";
const linkClass = "underline underline-offset-2 hover:text-cream";

export default function PrivacyPage() {
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
          מדיניות פרטיות
        </h1>
        <p className="mt-3 font-hebrew text-sm text-cream/60">
          עודכן לאחרונה: 10 בנובמבר 2026
        </p>

        <p className={paragraphClass}>
          מדיניות זו מסבירה איזה מידע נאסף כשאתם מבקרים באתר rockyourpeople.com
          של Rock Your People, ומה נעשה בו.
        </p>

        <h2 className={headingClass}>טופס יצירת הקשר</h2>
        <p className={paragraphClass}>
          הפרטים שאתם כותבים בטופס אינם נשמרים באתר. כשלוחצים על כפתור השליחה
          נפתחת שיחת וואטסאפ עם ההודעה שכתבתם, ואתם בוחרים אם לשלוח אותה. הודעה
          שנשלחת אלינו משמשת אותנו כדי לחזור אליכם ולטפל בפנייה. השימוש בוואטסאפ
          כפוף גם למדיניות הפרטיות של וואטסאפ.
        </p>

        <h2 className={headingClass}>הרשמה לשירה במופע</h2>
        <p className={paragraphClass}>
          כשאתם נרשמים באתר לשיר איתנו במופע, השם, מספר הטלפון וההערה שכתבתם
          נשמרים בגיליון Google Sheets שלנו, יחד עם השיר שבחרתם. אנחנו משתמשים
          בפרטים רק כדי לתאם איתכם את ההשתתפות במופע. הגיליון מאוחסן אצל Google.
        </p>

        <h2 className={headingClass}>עוגיות ופיקסל של Meta</h2>
        <p className={paragraphClass}>
          אם תאשרו זאת בהודעה שמופיעה באתר, נפעיל את הפיקסל של Meta (החברה
          שמפעילה את פייסבוק ואינסטגרם). הפיקסל והעוגיות שלו מעבירים ל-Meta מידע
          על הביקור שלכם, כמו הדפים שבהם צפיתם, לחיצות על קישורי הוואטסאפ, כתובת
          ה-IP ופרטי הדפדפן והמכשיר. אנחנו משתמשים בכך כדי למדוד את הפרסום שלנו
          ולהציג מודעות לאנשים שעשויים להתעניין בנו. Meta עשויה לעבד את המידע גם
          מחוץ לישראל ולהשתמש בו בהתאם למדיניות הפרטיות שלה.
        </p>
        <p className={paragraphClass}>
          תוכן ההודעה שאתם כותבים בטופס, השם ופרטי החברה לא מועברים ל-Meta דרך
          הפיקסל. אם לא תאשרו, הפיקסל לא יופעל.
        </p>

        <h2 className={headingClass}>שינוי הבחירה שלכם</h2>
        <p className={paragraphClass}>
          אפשר לשנות את הבחירה בכל עת דרך הקישור Cookie settings בתחתית האתר.
          אפשר גם למחוק עוגיות דרך הגדרות הדפדפן.
        </p>

        <h2 className={headingClass}>אחסון האתר</h2>
        <p className={paragraphClass}>
          האתר מאוחסן אצל ספק אירוח, שעשוי לרשום נתונים טכניים רגילים כמו כתובת
          IP ומועד הביקור לצורך הפעלת האתר ואבטחתו.
        </p>

        <h2 className={headingClass}>הזכויות שלכם ויצירת קשר</h2>
        <p className={paragraphClass}>
          אפשר לפנות אלינו כדי לעיין במידע ששמור אצלנו עליכם, לתקן אותו או לבקש
          למחוק אותו. נשמח לעזור ב
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
        </p>
      </main>
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
