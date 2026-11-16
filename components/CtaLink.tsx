import Link from "next/link";

type CtaLinkProps = {
  href?: string;
  children: string;
  className?: string;
  /** "light" = cream button for dark/magenta backgrounds, "dark" = black button for cream backgrounds */
  tone?: "light" | "dark";
  /** Where on the page the CTA sits (analytics contract: data-placement) */
  placement?: string;
  /** Open in a new tab (external links such as WhatsApp) */
  external?: boolean;
};

const BASE =
  "inline-flex min-h-[48px] items-center justify-center rounded-[5px] border px-6 py-2.5 text-center font-hebrew text-base font-bold leading-snug tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2";

const TONES = {
  light:
    "border-[#FBEEE3] bg-[#FBEEE3] text-[#1e1c1c] hover:bg-transparent hover:text-[#FBEEE3] focus-visible:outline-[#FBEEE3]",
  dark: "border-[#1e1c1c] bg-[#1e1c1c] text-[#FBEEE3] hover:bg-transparent hover:text-[#1e1c1c] focus-visible:outline-[#1e1c1c]",
} as const;

/** Primary call-to-action link (defaults to the contact form). */
export function CtaLink({
  href = "#contact",
  children,
  className = "",
  tone = "light",
  placement,
  external = false,
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      data-placement={placement}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      lang="he"
      dir="rtl"
      data-cta="primary"
      className={`${BASE} ${TONES[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}
