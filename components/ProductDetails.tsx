import { PRODUCT_DETAIL_SECTIONS } from "@/lib/product-details";
import { ProductDetailScrollAnchor } from "@/components/ProductDetailScrollAnchor";
import { ProductDetailSection } from "@/components/ProductDetailSection";

export function ProductDetails() {
  return (
    <div aria-label="Product experiences">
      <ProductDetailScrollAnchor />
      {PRODUCT_DETAIL_SECTIONS.map((detail) => (
        <ProductDetailSection key={detail.id} detail={detail} />
      ))}
    </div>
  );
}
