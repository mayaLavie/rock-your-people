import { SOCIAL_LINKS, YOUTUBE_EMBED_URL } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function VideoSection() {
  return (
    <section
      id="videos"
      className="bg-cream px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
      aria-labelledby="videos-heading"
    >
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          inverted
          eyebrow="On stage"
          title="See the experience in action"
          description="Feel the energy, the crowd, and the moment."
        />

        <div className="mt-10 overflow-hidden border-[3px] border-black sm:mt-12">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={YOUTUBE_EMBED_URL}
              title="Rock Your People — experience video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-cream"
          >
            YouTube channel
          </a>
        </div>
      </div>
    </section>
  );
}
