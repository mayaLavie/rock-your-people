import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/constants";

export function Gallery() {
  const [heroImage, ...gridImages] = GALLERY_IMAGES;

  return (
    <section
      id="gallery"
      className="py-8 sm:py-12"
      aria-label="Gallery"
    >
      <p className="mx-auto max-w-3xl px-4 pb-6 text-center text-base leading-relaxed text-cream/80 sm:px-6 sm:pb-8 sm:text-lg lg:px-10">
        Moments from the stage, the crowd, and the vibe.
      </p>

      <div className="flex w-full items-center justify-center">
        <Image
          src={encodeURI(heroImage.src)}
          alt={heroImage.alt}
          width={1200}
          height={1600}
          sizes="100vw"
          className="h-auto w-full object-contain object-center"
          priority
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {gridImages.map((image) => (
            <li key={image.src} className="aspect-[4/3]">
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
    <figure className="relative h-full w-full overflow-hidden bg-black/20">
      <Image
        src={encodeURI(src)}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 480px"
        className="object-cover object-center"
      />
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}
