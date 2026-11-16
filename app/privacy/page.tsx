import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { LegalPageHeader } from "@/components/LegalPageHeader";
import { LegalToc } from "@/components/LegalToc";
import { CONTACT_INSTAGRAM_HANDLE } from "@/lib/contact";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "איך Rock Your People משתמשת במידע ובעוגיות באתר",
};

const headingClass = "mt-10 scroll-mt-4 font-hebrew text-xl font-semibold text-cream";
const paragraphClass = "mt-3 font-hebrew leading-relaxed text-cream";
const listClass = "mt-3 list-disc space-y-2 pr-6 font-hebrew leading-relaxed text-cream marker:text-cream/60";
const linkClass = "underline underline-offset-2 hover:text-cream";

const TOC = [
  { id: "controller", title: "מי אחראית על המידע" },
  { id: "contact-form", title: "טופס יצירת הקשר" },
  { id: "song-signup", title: "הרשמה לשירה במופע" },
  { id: "cookies-meta", title: "עוגיות ופיקסל של Meta" },
  { id: "browser-storage", title: "מה נשמר בדפדפן שלכם" },
  { id: "change-choice", title: "שינוי הבחירה שלכם" },
  { id: "retention", title: "תקופת שמירה" },
  { id: "hosting", title: "אחסון האתר" },
  { id: "rights", title: "הזכויות שלכם ויצירת קשר" },
];

export default function PrivacyPage() {
  return (
    <>
      <LegalPageHeader />
      <main lang="he" dir="rtl" className="px-4 py-8 sm:px-6 sm:py-12">
        {/* Dark panel, as on /accessibility: cream on #1e1c1c clears 4.5:1, cream on the brand pink does not */}
        <div className="mx-auto max-w-3xl rounded-[5px] bg-[#1e1c1c] px-5 pb-10 pt-4 sm:px-10">
        <h1 className="mt-6 font-hebrew text-3xl font-semibold text-cream sm:text-4xl">
          מדיניות פרטיות
        </h1>
        <p className="mt-3 font-hebrew text-sm text-cream/90">
          עודכן לאחרונה: 16 בנובמבר 2026
        </p>

        <LegalToc items={TOC} />

        <p className={paragraphClass}>
          מדיניות זו מסבירה איזה מידע נאסף כשאתם מבקרים באתר rockyourpeople.com,
          למה, מי מקבל אותו ומה הזכויות שלכם. היא נכתבה בהתאם לאופן שבו האתר
          פועל בפועל.
        </p>

        <h2 id="controller" className={headingClass}>מי אחראית על המידע</h2>
        <p className={paragraphClass}>
          מחזיקת המידע והאחראית עליו היא Rock Your People (&quot;אנחנו&quot;). אפשר לפנות
          אלינו בכל עניין הנוגע למידע ב
          <a
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            וואטסאפ
          </a>{" "}
          במספר{" "}
          <span dir="ltr" className="whitespace-nowrap">
            052-463-2111
          </span>
          , או באינסטגרם{" "}
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            dir="ltr"
          >
            @{CONTACT_INSTAGRAM_HANDLE}
          </a>
          . מסירת פרטים באתר אינה חובה לפי חוק, והיא נעשית מרצונכם. בלי למסור
          פרטים אפשר לגלוש באתר ולפנות אלינו ישירות בוואטסאפ.
        </p>

        <h2 id="contact-form" className={headingClass}>טופס יצירת הקשר</h2>
        <p className={paragraphClass}>
          לטופס יש שני אופני פעולה, לפי ההגדרה של האתר באותה תקופה.
        </p>
        <ul className={listClass}>
          <li>
            אופן וואטסאפ: הפרטים שאתם כותבים בטופס אינם נשמרים באתר ואינם נשלחים
            לשרת שלנו. לחיצה על השליחה פותחת שיחת וואטסאפ עם הודעה מוכנה, ואתם
            בוחרים אם לשלוח אותה. הודעה שנשלחת אלינו משמשת אותנו כדי לחזור אליכם
            ולטפל בפנייה. השימוש בוואטסאפ כפוף גם למדיניות הפרטיות של וואטסאפ.
          </li>
          <li>
            אופן טופס: נאספים השם, מספר הטלפון, ואם מילאתם גם החברה או האירוע,
            ההודעה, סוג האירוע, מספר המשתתפים והתאריך המשוער. בנוסף נשמרים הדף
            שבו מילאתם את הטופס, המוצר שאליו התייחסתם ופרמטרי הקמפיין
            (utm_source ודומיו) אם הגעתם דרך מודעה ואישרתם עוגיות. הפרטים נשלחים
            לשירות ניהול פניות חיצוני (כגון גיליון גוגל או מערכת CRM) שהלהקה
            בוחרת, שעשוי להיות מופעל מחוץ לישראל, ומשמשים אותנו כדי לחזור
            אליכם בנוגע לאירוע. במקביל נפתחת שיחת וואטסאפ עם ההודעה שלכם. את
            הפרטים האלה אנחנו שומרים גם אם לא אישרתם עוגיות, כי מדובר בפנייה
            שביקשתם בעצמכם.
          </li>
        </ul>

        <h2 id="song-signup" className={headingClass}>הרשמה לשירה במופע</h2>
        <p className={paragraphClass}>
          כשאתם נרשמים באתר לשיר איתנו במופע, השם, מספר הטלפון וההערה שכתבתם
          נשמרים בגיליון Google Sheets שלנו, יחד עם השיר שבחרתם, באמצעות סקריפט
          של Google Apps Script. אנחנו משתמשים בפרטים רק כדי לתאם איתכם את
          ההשתתפות במופע. הגיליון מאוחסן אצל Google, שעשויה לעבד אותו גם מחוץ
          לישראל. סימון לב ליד שיר נשמר בדפדפן שלכם ונשלח לגיליון כסימון על השיר
          בלבד, בלי שם או טלפון. פתיחת חלון ההרשמה טוענת את מספרי הלבבות מ-Google, ולכן
          כתובת ה-IP שלכם נחשפת אליה
        </p>
        <p className={paragraphClass}>
          אם אישרתם עוגיות, בסיום ההרשמה נשלח ל-Meta, מהדפדפן וגם מהשרת שלנו,
          אירוע השלמת הרשמה (CompleteRegistration) עם התווית song-signup, יחד
          עם המידע הטכני שמתואר בסעיף על הפיקסל. השם, הטלפון וההערה שכתבתם, וכן
          השיר שבחרתם, אינם נשלחים ל-Meta. אם לא אישרתם עוגיות, האירוע אינו נשלח.
        </p>

        <h2 id="cookies-meta" className={headingClass}>עוגיות ופיקסל של Meta</h2>
        <p className={paragraphClass}>
          רק אם תאשרו זאת בהודעה שמופיעה באתר (הכפתור &quot;אישור&quot;), נפעיל את הפיקסל
          של Meta (החברה שמפעילה את פייסבוק ואינסטגרם) ואת ממשק ה-Conversions
          API שלה. עד לאישור ובכל מקרה של דחייה לא נטען הפיקסל ולא נשלח
          ל-Meta שום מידע. המטרות הן מדידה של הפרסום שלנו והצגת מודעות לאנשים
          שעשויים להתעניין בנו.
        </p>
        <p className={paragraphClass}>לאחר האישור נשלח ל-Meta, מהדפדפן וגם מהשרת שלנו:</p>
        <ul className={listClass}>
          <li>
            מידע על הביקור: הדפים שבהם צפיתם, צפייה בחוויות השונות, לחיצות על
            קישורי וואטסאפ, שליחת הטופס והשלמת הרשמה לשירה במופע, וכן פרמטרי הקמפיין (utm) וכתובת הדף ללא
            שאר הפרמטרים שבה. מזהה הלחיצה על המודעה (fbclid) אינו נשלח כפרמטר,
            והוא משמש רק ליצירת העוגייה _fbc.
          </li>
          <li>
            כתובת ה-IP ופרטי הדפדפן והמכשיר (user agent), שהשרת שלנו מעביר
            ל-Meta.
          </li>
          <li>
            מזהי העוגיות _fbp ו-_fbc, שנשמרות בדפדפן עד 90 יום.
          </li>
          <li>
            באופן טופס, כשאתם שולחים פנייה: מספר הטלפון והשם הפרטי, מוצפנים
            בשיטת SHA-256 לפני שהם נשלחים מהשרת, ובדפדפן באמצעות הפיקסל. הצפנה
            כזו היא פסאודונימיזציה ולא אנונימיזציה: Meta יכולה להתאים את הערכים
            המוצפנים לחשבונות שבהם יש לה את אותם פרטים, ולכן זה עדיין מידע
            אישי. תוכן ההודעה, שם החברה, סוג האירוע, מספר המשתתפים והתאריך אינם
            נשלחים ל-Meta.
          </li>
        </ul>
        <p className={paragraphClass}>
          Meta עשויה לעבד את המידע גם מחוץ לישראל, בין היתר באירלנד ובארצות
          הברית, ולהשתמש בו בהתאם למדיניות הפרטיות שלה. על המידע שברשות Meta חלה
          המדיניות שלה.
        </p>

        <h2 id="browser-storage" className={headingClass}>מה נשמר בדפדפן שלכם</h2>
        <ul className={listClass}>
          <li>
            פרמטרי קמפיין (utm) ומזהה fbclid מכתובת הדף נשמרים ב-sessionStorage
            של הלשונית, גם לפני שאישרתם עוגיות. הם נשארים בדפדפן שלכם, אינם
            נשלחים לשום מקום לפני אישור, ונמחקים עם סגירת הלשונית.
          </li>
          <li>
            ב-sessionStorage נשמר גם סימון זמני של הכפתור שדרכו הגעתם לטופס
            יצירת הקשר (למשל כפתור בראש הדף), כדי שנדע איזו הנחיה לפעולה עובדת.
            הוא מצורף לאירוע הפנייה ונשלח ל-Meta רק אחרי אישור.
          </li>
          <li>
            הבחירה שלכם לגבי עוגיות נשמרת ב-localStorage, ואם אישרתם נשמרת גם
            עוגייה ראשונית (first-party) בשם ryp_consent, חתומה בחתימה דיגיטלית,
            למשך כ-6 חודשים. השרת שלנו שולח אירועים ל-Meta רק כשהעוגייה הזו
            תקפה. בדחייה או בביטול היא נמחקת.
          </li>
          <li>
            הלבבות שסימנתם ליד שירים נשמרים ב-localStorage.
          </li>
        </ul>

        <h2 id="change-choice" className={headingClass}>שינוי הבחירה שלכם</h2>
        <p className={paragraphClass}>
          אפשר לשנות את הבחירה בכל עת דרך הקישור &quot;הגדרות עוגיות&quot; (Cookie
          settings) בתחתית האתר. דחייה או ביטול פועלים מיד, בלי טעינה מחדש של
          הדף: הפיקסל מפסיק לפעול, עוגיות _fbp ו-_fbc נמחקות, והשרת מפסיק לקבל
          אירועים. אפשר גם למחוק עוגיות דרך הגדרות הדפדפן. דחיית העוגיות אינה
          משפיעה על השימוש באתר.
        </p>

        <h2 id="retention" className={headingClass}>תקופת שמירה</h2>
        <p className={paragraphClass}>
          פרטי פנייה שנמסרו בטופס או בהרשמה לשירה נשמרים עד 24 חודשים ממועד
          הפנייה, אלא אם נדרש אחרת לפי דין. נתוני הפיקסל וה-Conversions API
          נשמרים אצל Meta בהתאם למדיניות שלה. עוגיות _fbp ו-_fbc נשמרות בדפדפן
          עד 90 יום.
        </p>

        <h2 id="hosting" className={headingClass}>אחסון האתר</h2>
        <p className={paragraphClass}>
          האתר מאוחסן אצל ספק אירוח, שעשוי לרשום נתונים טכניים רגילים כמו כתובת
          IP ומועד הביקור לצורך הפעלת האתר ואבטחתו. השרת שלנו משתמש בכתובת ה-IP
          גם כדי להגביל פניות חוזרות מהירות (הגנה מפני שימוש לרעה), בזיכרון
          בלבד, ובלי לשמור אותה.
        </p>

        <h2 id="rights" className={headingClass}>הזכויות שלכם ויצירת קשר</h2>
        <p className={paragraphClass}>
          אפשר לפנות אלינו כדי לעיין במידע ששמור אצלנו עליכם, לתקן אותו או
          לבקש למחוק אותו. נשמח לעזור באותם ערוצי קשר שצוינו בראש המדיניות.
          כדי שנוכל לאתר את המידע, ציינו את השם ומספר הטלפון שמסרתם. בקשת מחיקה
          אינה מוחקת מידע שנמצא אצל Meta או אצל וואטסאפ; לשם כך יש לפנות אליהן
          ישירות.
        </p>
        </div>
      </main>
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
