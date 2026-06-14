import {
  ABOUT_NAV_LINK,
  EXPERIENCES_NAV_LINK,
  NAV_LINKS,
  PRODUCT_NAV_LINKS,
} from "@/lib/constants";

const NAV_LINK_CLASS =
  "text-xs font-medium uppercase tracking-[0.12em] text-cream/90 transition hover:text-cream sm:text-sm";

const DROPDOWN_LINK_CLASS =
  "block whitespace-nowrap px-4 py-2.5 text-sm font-medium uppercase tracking-[0.1em] text-cream transition hover:bg-cream/10";

type DesktopNavProps = {
  className?: string;
};

export function DesktopNav({
  className = "hidden items-center justify-center gap-5 md:flex md:gap-6 lg:hidden",
}: DesktopNavProps) {
  return (
    <nav className={className} aria-label="Main navigation">
      <a href={ABOUT_NAV_LINK.href} className={NAV_LINK_CLASS}>
        {ABOUT_NAV_LINK.label}
      </a>

      <div className="group relative">
        <a href={EXPERIENCES_NAV_LINK.href} className={NAV_LINK_CLASS}>
          {EXPERIENCES_NAV_LINK.label}
        </a>
        <div
          className="pointer-events-none absolute left-1/2 top-full z-[250] min-w-[240px] -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
          role="menu"
          aria-label="Experiences"
        >
          <ul className="border-2 border-cream bg-magenta py-1 shadow-lg">
            {PRODUCT_NAV_LINKS.map((link) => (
              <li key={link.href} role="none">
                <a href={link.href} className={DROPDOWN_LINK_CLASS} role="menuitem">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {NAV_LINKS.map((link) => (
        <a key={link.href} href={link.href} className={NAV_LINK_CLASS}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
