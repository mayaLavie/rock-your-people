import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Gallery() {
  return (
    <section
      id="gallery"
      className="px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          title="Energy you can feel"
          titleClassName="!text-2xl sm:!text-3xl lg:!text-4xl"
          description="Moments from the stage, the crowd, and the vibe."
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:mt-12 lg:gap-5">
          {GALLERY_IMAGES.map((image, index) => (
            <li
              key={image.src}
              className={
                index === 0
                  ? "col-span-2 aspect-[2/1] md:col-span-2 md:aspect-auto md:min-h-[280px]"
                  : "aspect-square"
              }
            >
              <GalleryImage src={image.src} alt={image.alt} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type GalleryImageProps = {
  src: string;
  alt: string;
};

function GalleryImage({ src, alt }: GalleryImageProps) {
  return (
    <figure className="relative h-full w-full overflow-hidden border-[3px] border-cream bg-black/20">
      <Image
        src={encodeURI(src)}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
        className="object-cover object-center"
        priority={src.includes("forGallery1")}
      />
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}
