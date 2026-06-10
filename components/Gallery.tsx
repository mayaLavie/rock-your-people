import Image from "next/image";
import { GALLERY_IMAGES, TRIO_360_SECTION_BG } from "@/lib/constants";

type StackLayout = {
  wrapperClass: string;
  aspectClass: string;
  sizes: string;
};

const GALLERY_STACK_LAYOUTS: StackLayout[] = [
  {
    wrapperClass: "w-full",
    aspectClass: "aspect-[4/3]",
    sizes: "100vw",
  },
  {
    wrapperClass: "w-[92%] ml-auto",
    aspectClass: "aspect-[3/4]",
    sizes: "92vw",
  },
  {
    wrapperClass: "w-full px-5 sm:px-10",
    aspectClass: "aspect-[16/10]",
    sizes: "100vw",
  },
  {
    wrapperClass: "w-[84%]",
    aspectClass: "aspect-[5/4]",
    sizes: "84vw",
  },
  {
    wrapperClass: "w-full sm:w-[94%] mx-auto",
    aspectClass: "aspect-[4/5]",
    sizes: "(max-width: 640px) 100vw, 94vw",
  },
];

export function Gallery() {
  const [heroImage, ...restImages] = GALLERY_IMAGES;
  const stackImages = restImages.filter(
    (image) => image.src !== TRIO_360_SECTION_BG.src,
  );

  return (
    <section id="gallery" className="pb-8 sm:pb-12" aria-label="Gallery">
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

      <ul className="mt-2 flex flex-col gap-3 sm:gap-4">
        {stackImages.map((image, index) => {
          const layout = GALLERY_STACK_LAYOUTS[index] ?? GALLERY_STACK_LAYOUTS[0]!;

          return (
            <li key={image.src} className={layout.wrapperClass}>
              <GalleryStackImage
                src={image.src}
                alt={image.alt}
                aspectClass={layout.aspectClass}
                sizes={layout.sizes}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type GalleryStackImageProps = {
  src: string;
  alt: string;
  aspectClass: string;
  sizes: string;
};

function GalleryStackImage({
  src,
  alt,
  aspectClass,
  sizes,
}: GalleryStackImageProps) {
  return (
    <figure
      className={`relative w-full overflow-hidden bg-black/20 ${aspectClass}`}
    >
      <Image
        src={encodeURI(src)}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-center"
      />
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}
