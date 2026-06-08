import { STORY_SECTION_PARAGRAPHS } from "@/lib/constants";

export function SocialProof() {
  return (
    <section
      id="experience"
      className="border-b-[3px] border-cream px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8"
      aria-labelledby="experience-heading"
    >
      <h2 id="experience-heading" className="sr-only">
        הסיפור שלנו
      </h2>
      <div
        lang="he"
        dir="rtl"
        className="mx-auto max-w-3xl space-y-4 font-hebrew text-pretty text-center text-[14px] font-medium leading-relaxed text-[#FBEEE3]"
      >
        {STORY_SECTION_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
