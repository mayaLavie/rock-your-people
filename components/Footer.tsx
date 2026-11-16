import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { SOCIAL_LINKS } from "@/lib/constants";

const LINK_CLASS =
  "inline-flex min-h-[44px] items-center px-1 font-hebrew text-[15px] font-semibold text-cream transition hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

const LEGAL_LINK_CLASS =
  "inline-flex min-h-[44px] items-center px-1 font-hebrew text-[14px] text-cream/90 transition hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      lang="he"
      dir="rtl"
      className="border-t-[3px] border-cream bg-[#1e1c1c] px-4 py-10 sm:px-6 sm:py-14 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p lang="en" className="font-display text-xl uppercase text-cream">
              Rock Your People
            </p>
            <p className="mt-3 font-hebrew text-[15px] leading-relaxed text-cream/90">
              חוויות מוזיקליות אינטראקטיביות לחברות, צוותים ואירועים בלתי נשכחים
            </p>
          </div>

          <nav aria-label="ניווט תחתון">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              <li>
                <Link href="/#contact" className={LINK_CLASS}>
                  צור קשר
                </Link>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  אינסטגרם
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  וואטסאפ
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-cream/25 pt-5 text-cream/90">
          <Link href="/privacy" className={LEGAL_LINK_CLASS}>
            מדיניות פרטיות
          </Link>
          <Link href="/accessibility" className={LEGAL_LINK_CLASS}>
            הצהרת נגישות
          </Link>
          <CookieSettingsButton className={LEGAL_LINK_CLASS} />
          <p className="m-0 font-hebrew text-[14px] text-cream/90 md:me-auto">
            כל הזכויות שמורות ל-Rock Your People © {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
