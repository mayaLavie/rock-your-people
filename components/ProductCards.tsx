import Image from "next/image";
import { PRODUCTS } from "@/lib/constants";

const STAGE_IMAGE_SRC = "/images/gemini band pic.png";
const TRIO_IMAGE_SRC = "/images/Screenshot trio 360.png";
const WORKSHOP_IMAGE_SRC = "/images/workshop4.png";

const CARD_BORDER = "border-2 border-cream sm:border-[3px]";
const STAGE_TITLE =
  "font-stage-title uppercase leading-none tracking-wide text-brand-yellow";

const DETAIL_HREF: Record<(typeof PRODUCTS)[number]["id"], string> = {
  "trio-360": "#trio-360",
  "your-people-on-stage": "#your-people-on-stage",
  "musical-leadership-workshop": "#leadership-workshop",
};

export function ProductCards() {
  return (
    <section
      id="products"
      className="relative px-3 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6"
      aria-labelledby="products-heading"
    >
      <h2 id="products-heading" className="sr-only">
        Our experiences
      </h2>
      <ul className="mx-auto grid w-full max-w-[1400px] grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="aspect-[3/4] min-w-0 w-full">
            <a
              href={DETAIL_HREF[product.id]}
              className="group block h-full cursor-pointer transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              aria-label={`Learn more about ${product.title}`}
            >
              <ProductCard product={product} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Product = (typeof PRODUCTS)[number];

function ProductCard({ product }: { product: Product }) {
  if (product.variant === "stage") {
    return (
      <article
        className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
      >
        <Image
          src={encodeURI(STAGE_IMAGE_SRC)}
          alt=""
          fill
          sizes="(max-width: 640px) 33vw, 33vw"
          className="scale-110 object-cover object-[50%_115%] transition duration-300 group-hover:brightness-110"
        />
        <div className="relative z-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-2 sm:p-3">
          <h3 className={`${STAGE_TITLE} text-[17px] sm:text-[19px] md:text-[21px]`}>
            {product.title}
          </h3>
        </div>
      </article>
    );
  }

  if (product.variant === "trio") {
    return (
      <article
        className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
      >
        <Image
          src={encodeURI(TRIO_IMAGE_SRC)}
          alt=""
          fill
          sizes="(max-width: 640px) 33vw, 33vw"
          className="object-cover object-center transition duration-300 group-hover:brightness-110"
        />
        <h3 className="sr-only">Trio 360</h3>
      </article>
    );
  }

  return (
    <article
      className={`relative h-full w-full overflow-hidden ${CARD_BORDER} bg-black`}
    >
      <Image
        src={encodeURI(WORKSHOP_IMAGE_SRC)}
        alt=""
        fill
        sizes="(max-width: 640px) 33vw, 33vw"
        className="object-cover object-center transition duration-300 group-hover:brightness-110"
      />
      <h3 className="sr-only">{product.title}</h3>
    </article>
  );
}
