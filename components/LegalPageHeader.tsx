import Image from "next/image";
import Link from "next/link";
import { TITLE_IMAGE } from "@/lib/constants";

/** Simple top bar for stand-alone text pages (accessibility statement): logo plus a way back. */
export function LegalPageHeader() {
  return (
    <header className="border-b border-cream/25 bg-magenta px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link href="/" aria-label="Rock Your People — חזרה לעמוד הבית" className="block shrink-0">
          <Image
            src={TITLE_IMAGE.src}
            alt=""
            width={TITLE_IMAGE.width}
            height={TITLE_IMAGE.height}
            sizes="56px"
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav aria-label="ניווט עליון" lang="he" dir="rtl" className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-[5px] px-3 font-hebrew text-[15px] font-semibold text-cream underline-offset-4 hover:underline"
          >
            חזרה לאתר
          </Link>
          <Link
            href="/#contact"
            className="inline-flex min-h-[44px] items-center rounded-[5px] border border-cream/90 px-4 font-hebrew text-[15px] font-semibold text-cream transition hover:bg-cream hover:text-magenta"
          >
            צור קשר
          </Link>
        </nav>
      </div>
    </header>
  );
}
