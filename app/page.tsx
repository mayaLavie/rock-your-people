import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TopSectionShell } from "@/components/TopSectionShell";
import { ProductCards } from "@/components/ProductCards";
import { SocialProof } from "@/components/SocialProof";
import { ProductDetails } from "@/components/ProductDetails";
import { Gallery } from "@/components/Gallery";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <TopSectionShell>
        <div className="flex min-h-dvh flex-col">
          <Hero />
        </div>
      </TopSectionShell>
      <ProductCards />
      <main className="bg-magenta">
        <SocialProof />
      </main>
      <ProductDetails />
      <div className="bg-magenta">
        <Gallery />
      </div>
      <ContactSection />
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
