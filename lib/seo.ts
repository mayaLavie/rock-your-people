import type { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rockyourpeople.com";
export const SITE_NAME = "Rock Your People";
export const SITE_DESCRIPTION = "חוויות מוזיקליות אינטראקטיביות לחברות, צוותים ואירועים";
export const OG_IMAGE = {
  url: "/og/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Rock Your People - מחברים אנשים דרך מוסיקה",
};
export const OPEN_GRAPH_BASE: OpenGraph = {
  type: "website",
  locale: "he_IL",
  siteName: SITE_NAME,
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  images: [OG_IMAGE],
};
