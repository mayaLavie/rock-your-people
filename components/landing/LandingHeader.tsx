"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import { TITLE_IMAGE } from "@/lib/constants";

const subscribe = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

/** Minimal landing header: logo (home, UTMs preserved) + WhatsApp. No site nav. */
export function LandingHeader({ whatsappUrl }: { whatsappUrl: string }) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);

  return (
    <header className="sticky top-0 z-[200] bg-magenta px-4 py-1.5 sm:px-6 sm:py-2">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2">
        <a
          href={`/${search}`}
          aria-label="Rock Your People, לעמוד הבית"
          className="flex min-h-[44px] items-center rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-cream"
        >
          <Image
            src={TITLE_IMAGE.src}
            alt=""
            width={TITLE_IMAGE.width}
            height={TITLE_IMAGE.height}
            priority
            className="h-11 w-auto sm:h-12"
          />
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="שליחת הודעה בוואטסאפ"
          className="flex h-11 w-11 items-center justify-center rounded-full text-cream transition hover:bg-cream/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      </div>
    </header>
  );
}
