export const PRODUCT_SLUGS = [
  "on-stage",
  "band-in-a-day",
  "trio-360",
  "rock-your-dj",
] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];
export type ProductOrGeneral = ProductSlug | "general";

/** Section ids in lib/product-details.ts mapped to the shared product slugs. */
const DETAIL_ID_TO_SLUG: Record<string, ProductSlug> = {
  "your-people-on-stage": "on-stage",
  "leadership-workshop": "band-in-a-day",
  "musical-leadership-workshop": "band-in-a-day",
  "trio-360": "trio-360",
  "beer-office": "rock-your-dj",
};

export function productSlugForDetailId(id: string): ProductSlug | undefined {
  return DETAIL_ID_TO_SLUG[id];
}

export const PRODUCT_NAMES_HE: Record<ProductSlug, string> = {
  "on-stage": "אתם על הבמה",
  "band-in-a-day": "Band in a Day",
  "trio-360": "Trio 360",
  "rock-your-dj": "Rock Your DJ",
};

export function isProductSlug(value: unknown): value is ProductSlug {
  return (
    typeof value === "string" &&
    (PRODUCT_SLUGS as readonly string[]).includes(value)
  );
}

/** Product of the closest [data-product] ancestor, else the page root main[data-product], else "general". */
export function detectProduct(from?: Element | null): ProductOrGeneral {
  if (typeof document === "undefined") return "general";
  const near = from?.closest<HTMLElement>("[data-product]")?.dataset.product;
  if (isProductSlug(near)) return near;
  const root = document.querySelector<HTMLElement>("main[data-product]")
    ?.dataset.product;
  return isProductSlug(root) ? root : "general";
}
