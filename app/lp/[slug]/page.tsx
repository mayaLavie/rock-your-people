import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ReviewsSection } from "@/components/ReviewsSection";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingHeader } from "@/components/landing/LandingHeader";
import {
  HERO_CTA_ID,
  LandingExperience,
  LandingFits,
  LandingHero,
} from "@/components/landing/LandingSections";
import { LandingStickyBar } from "@/components/landing/LandingStickyBar";
import { buildContactMessage, buildWhatsAppUrl } from "@/lib/contact";
import {
  LANDING_SLUGS,
  USE_CASE_INTRO,
  getLandingContent,
  landingTitle,
} from "@/lib/landing-content";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = getLandingContent(slug);
  if (!content) return {};
  const title = landingTitle(content);
  const url = `/lp/${content.slug}`;
  return {
    title,
    description: content.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: content.metaDescription,
      url,
      siteName: "Rock Your People",
      locale: "he_IL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.metaDescription,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getLandingContent(slug);
  if (!content) notFound();

  const ctaLabel = `דברו איתנו על ${content.ctaTarget}`;
  const whatsappUrl = buildWhatsAppUrl(
    buildContactMessage({
      name: "",
      company: "",
      message: `אני אשמח לקבל פרטים על ${content.name}.`,
    }),
  );

  return (
    <main
      data-product={content.slug}
      data-page-type="landing"
      lang="he"
      dir="rtl"
      className="bg-magenta"
    >
      <LandingHeader whatsappUrl={whatsappUrl} />
      <LandingHero content={content} ctaLabel={ctaLabel} whatsappUrl={whatsappUrl} />
      <LandingExperience content={content} />
      <LandingFits content={content} intro={USE_CASE_INTRO} />
      <ReviewsSection />
      <LandingFaq items={content.faq} />
      {/* Contact + footer are authored for an LTR page (English headings); keep them that way. */}
      <div dir="ltr">
        <ContactSection />
        <div className="bg-magenta pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
          <Footer />
        </div>
      </div>
      <LandingStickyBar
        label={ctaLabel}
        whatsappUrl={whatsappUrl}
        heroCtaId={HERO_CTA_ID}
      />
    </main>
  );
}
