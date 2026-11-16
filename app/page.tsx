import type { Metadata } from "next";
import { OG_IMAGE, OPEN_GRAPH_BASE, SITE_DESCRIPTION } from "@/lib/seo";
import { DesktopEditorialShell } from "@/components/DesktopEditorialShell";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TopSectionShell } from "@/components/TopSectionShell";
import { ProductCards } from "@/components/ProductCards";
import { SocialProof } from "@/components/SocialProof";
import { FAQSection } from "@/components/FAQSection";
import { ProductDetails } from "@/components/ProductDetails";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Gallery } from "@/components/Gallery";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { SongSignupPopup } from "@/components/SongSignupPopup";
import { SONG_SIGNUP_POPUP_ENABLED } from "@/lib/constants";

const HOME_TITLE = "Rock Your People | מופעים וסדנאות מוזיקה לחברות ולאירועים";

export const metadata: Metadata = {
  // absolute: the root template would otherwise double the brand name.
  title: { absolute: HOME_TITLE },
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH_BASE, title: HOME_TITLE, url: "/" },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Home() {
  return (
    <DesktopEditorialShell>
      <Header />
      <TopSectionShell>
        <div className="relative flex min-h-dvh flex-col">
          <Hero />
        </div>
      </TopSectionShell>
      <ProductCards
        beforeEngagement={
          <div className="bg-magenta">
            <Gallery />
          </div>
        }
      />
      <ProductDetails />
      <ReviewsSection />
      <main className="bg-magenta">
        <SocialProof />
        <FAQSection />
      </main>
      <ContactSection />
      <div className="bg-magenta">
        <Footer />
      </div>
      {SONG_SIGNUP_POPUP_ENABLED ? <SongSignupPopup /> : null}
    </DesktopEditorialShell>
  );
}
