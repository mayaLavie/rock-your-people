import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AttributionCapture } from "@/components/AttributionCapture";
import { DeferredConsent } from "@/components/Deferred";
import { JsonLd } from "@/components/JsonLd";
import { OG_IMAGE, OPEN_GRAPH_BASE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

/*
 * Fonts are self-hosted (app/fonts/*.woff2, from the @fontsource packages) so the
 * build works offline. Families, weights, subsets and CSS variable names match the
 * previous next/font/google setup. Families with hebrew + latin subsets are loaded
 * as two faces with a literal unicode-range each (next/font needs literals) and combined into one CSS variable below.
 */
const bowlby = localFont({
  src: "./fonts/bowlby-one-sc-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-bowlby",
});

const inter = localFont({
  preload: false, // body default only; LP/home above-the-fold text is Rubik (Hebrew) or Bowlby, so Inter is fetched on demand and not competing with the LCP image
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

const bebasNeue = localFont({
  preload: false, // only used by the home experience carousel, below the fold
  src: "./fonts/bebas-neue-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-bebas",
});

const rubikLatin = localFont({
  src: "./fonts/rubik-latin-wght-normal.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" }],
});

const rubikHebrew = localFont({
  src: "./fonts/rubik-hebrew-wght-normal.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F" }],
});

const varelaLatin = localFont({
  preload: false, // only used by the home experience carousel, below the fold
  src: "./fonts/varela-round-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" }],
});

const varelaHebrew = localFont({
  preload: false, // only used by the home experience carousel, below the fold
  src: "./fonts/varela-round-hebrew-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F" }],
});

const bodyFontVars = {
  "--font-rubik": `${rubikLatin.style.fontFamily}, ${rubikHebrew.style.fontFamily}`,
  "--font-varela": `${varelaLatin.style.fontFamily}, ${varelaHebrew.style.fontFamily}`,
} as React.CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { ...OPEN_GRAPH_BASE },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff2d73",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" className="scroll-smooth">
      <body
        style={bodyFontVars}
        className={`${bowlby.variable} ${inter.variable} ${bebasNeue.variable} min-h-full bg-background font-sans text-foreground antialiased`}
      >
        <JsonLd />
        <AttributionCapture />
        {children}
        <DeferredConsent />
      </body>
    </html>
  );
}
