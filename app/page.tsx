import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TopSectionShell } from "@/components/TopSectionShell";
import { ProductCards } from "@/components/ProductCards";
import { SocialProof } from "@/components/SocialProof";
import { ProductDetails } from "@/components/ProductDetails";
import { VideoSection } from "@/components/VideoSection";
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
        <main>
          <ProductCards />
          <SocialProof />
        </main>
      </TopSectionShell>
      <ProductDetails />
      <div className="bg-magenta">
        <Gallery />
      </div>
      <VideoSection />
      <ContactSection />
      <div className="bg-magenta">
        <Footer />
      </div>
    </>
  );
}
