import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-cream px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl uppercase text-cream">
              Rock Your People
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Interactive live music experiences for companies, teams, and
              unforgettable events.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs font-semibold uppercase tracking-wider text-cream/75 transition hover:text-cream"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex flex-wrap gap-4">
            <li>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-wider text-cream/75 hover:text-cream"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-wider text-cream/75 hover:text-cream"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cream/20 pt-8 text-xs text-cream/50">
          <p>© {year} Rock Your People. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-cream">
            Privacy Policy
          </Link>
          <CookieSettingsButton className="hover:text-cream" />
        </div>
      </div>
    </footer>
  );
}
