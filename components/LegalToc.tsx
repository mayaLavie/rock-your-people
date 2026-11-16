type LegalTocItem = { id: string; title: string };

/** In-page table of contents for the long legal pages (anchors resolve to h2 ids). */
export function LegalToc({ items }: { items: LegalTocItem[] }) {
  return (
    <nav aria-label="תוכן העניינים" className="mt-6 rounded-[5px] border border-cream/30 px-4 py-3">
      <p className="font-hebrew text-sm font-semibold text-cream">בעמוד הזה</p>
      <ol className="mt-2 list-decimal space-y-1 pr-5 font-hebrew text-sm text-cream marker:text-cream/70">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-block min-h-[28px] py-0.5 underline underline-offset-2 hover:text-white"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
