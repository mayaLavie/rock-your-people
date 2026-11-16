import { SectionHeading } from "@/components/ui/SectionHeading";

type Item = { readonly question: string; readonly answer: string };

/** Native details/summary accordion, styled like the site FAQ. Items are chosen per product. */
export function LandingFaq({ items }: { items: readonly Item[] }) {
  return (
    <section
      id="faq"
      dir="rtl"
      lang="he"
      aria-label="שאלות נפוצות"
      className="border-b-[3px] border-cream bg-magenta px-4 py-10 sm:px-6 lg:px-10"
    >
      <SectionHeading
        title="שאלות נפוצות"
        titleClassName="text-cream font-hebrew! normal-case text-[28px]! font-bold"
      />
      <div className="mx-auto mt-6 flex w-full max-w-[52rem] flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group overflow-hidden rounded-2xl border border-[#FBEEE3]/25 bg-[#FBEEE3]/10 open:border-[#FBEEE3]/35 open:bg-[#FBEEE3]/15"
          >
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-right marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream [&::-webkit-details-marker]:hidden">
              <span className="flex-1 font-hebrew text-pretty text-[15px] font-bold leading-snug text-[#FBEEE3]">
                {item.question}
              </span>
              <span
                aria-hidden
                className="relative flex h-5 w-5 shrink-0 items-center justify-center text-[#FBEEE3]"
              >
                <span className="absolute h-0.5 w-4 rounded-full bg-current" />
                <span className="absolute h-0.5 w-4 rotate-90 rounded-full bg-current transition-transform group-open:scale-0" />
              </span>
            </summary>
            <div className="space-y-2.5 px-5 pb-4">
              {item.answer.split("\n\n").map((p) => (
                <p
                  key={p}
                  className="m-0 font-hebrew text-pretty text-[14px] leading-relaxed text-[#FBEEE3]/90"
                >
                  {p}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
