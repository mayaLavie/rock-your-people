import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PATHS = [
  "/",
  "/privacy",
  "/accessibility",
  "/lp/on-stage",
  "/lp/band-in-a-day",
  "/lp/trio-360",
  "/lp/rock-your-dj",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    priority: path === "/" ? 1 : 0.7,
  }));
}
