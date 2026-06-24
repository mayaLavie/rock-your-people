"use client";

import { useId, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_ITEMS } from "@/lib/constants";

function FaqToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="relative flex h-5 w-5 shrink-0 items-center justify-center text-[#FBEEE3]"
    >
      <span className="absolute h-0.5 w-4 rounded-full bg-current" />
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "scale-0" : "scale-100 rotate-90"
        }`}
      />
    </span>
  );
}

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

function FaqItem({ id, question, answer, open, onToggle }: FaqItemProps) {
  const answerId = `${id}-answer`;

  return (
    <article
      dir="rtl"
      lang="he"
      className={`overflow-hidden rounded-2xl border border-[#FBEEE3]/25 bg-[#FBEEE3]/10 shadow-[0_10px_40px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 hover:border-[#FBEEE3]/40 hover:bg-[#FBEEE3]/15 hover:shadow-[0_12px_44px_rgba(0,0,0,0.18)] ${
        open ? "border-[#FBEEE3]/35 bg-[#FBEEE3]/15" : ""
      }`}
    >
      <h3>
        <button
          type="button"
          id={id}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
          dir="rtl"
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-right sm:px-6 sm:py-5"
        >
          <span className="flex-1 text-right font-hebrew text-pretty text-[15px] font-bold leading-snug text-[#FBEEE3] sm:text-base">
            {question}
          </span>
          <FaqToggleIcon open={open} />
        </button>
      </h3>
      <div
        id={answerId}
        role="region"
        aria-labelledby={id}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 motion-reduce:opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-right font-hebrew text-pretty text-[14px] leading-relaxed text-[#FBEEE3]/85 sm:px-6 sm:pb-5 sm:text-[15px]">
            {answer}
          </p>
        </div>
      </div>
    </article>
  );
}

export function FAQSection() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      dir="rtl"
      lang="he"
      className="scroll-mt-24 border-b-[3px] border-cream bg-magenta px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
      aria-label="FAQ — שאלות נפוצות"
    >
      <SectionHeading
        title="FAQ"
        description="שאלות נפוצות"
        descriptionLang="he"
        descriptionDir="rtl"
        descriptionClassName="font-hebrew text-[#FBEEE3]/90"
        titleClassName="text-cream"
      />

      <div className="mx-auto mt-10 flex w-full max-w-[52rem] flex-col gap-3 sm:mt-12 sm:gap-4">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <FaqItem
              key={item.question}
              id={`${baseId}-item-${index}`}
              question={item.question}
              answer={item.answer}
              open={isOpen}
              onToggle={() => setOpenIndex(isOpen ? null : index)}
            />
          );
        })}
      </div>
    </section>
  );
}
