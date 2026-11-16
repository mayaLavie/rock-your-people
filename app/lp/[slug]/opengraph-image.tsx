import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LANDING_SLUGS, getLandingContent } from "@/lib/landing-content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rock Your People";

export function generateStaticParams() {
  return LANDING_SLUGS.map((slug) => ({ slug }));
}

/*
 * Satori draws glyphs in logical order and does no bidi reordering, so Hebrew
 * comes out mirrored. We reorder to visual order ourselves, line by line:
 * reverse the line, then flip embedded Latin/digit runs back.
 */
function visual(line: string): string {
  const reversed = [...line].reverse().join("");
  return reversed.replace(/[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]|[A-Za-z0-9]/g, (run) =>
    [...run].reverse().join(""),
  );
}

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if (current && (current + " " + word).length > max) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const FONT_DIR = join(process.cwd(), "components/landing/og-fonts");

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getLandingContent(slug);
  const name = content?.name ?? "Rock Your People";
  const audience = content?.audience ?? "";

  const [hebrew, latin, bowlby] = await Promise.all([
    readFile(join(FONT_DIR, "rubik-hebrew-700.ttf")),
    readFile(join(FONT_DIR, "rubik-latin-700.ttf")),
    readFile(join(FONT_DIR, "bowlby-one-sc-latin-400.ttf")),
  ]);

  const isLatinName = /^[\x00-\x7F]+$/.test(name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ff2d73",
          color: "#f4e8d4",
          padding: 64,
          border: "14px solid #f4e8d4",
          fontFamily: "Rubik",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Bowlby",
            fontSize: 44,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Rock Your People
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              fontFamily: isLatinName ? "Bowlby" : "Rubik",
              fontSize: isLatinName ? 120 : 150,
              lineHeight: 1.05,
              textTransform: isLatinName ? "uppercase" : "none",
            }}
          >
            {isLatinName ? name : visual(name)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 40,
              lineHeight: 1.3,
              flexDirection: "column",
              alignItems: "flex-end",
              color: "#ffe500",
              maxWidth: 1000,
            }}
          >
            {wrap(audience, 38).map((line) => (
              <div key={line} style={{ display: "flex", justifyContent: "flex-end" }}>
                {visual(line)}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Rubik", data: hebrew, weight: 700, style: "normal" },
        { name: "Rubik", data: latin, weight: 700, style: "normal" },
        { name: "Bowlby", data: bowlby, weight: 400, style: "normal" },
      ],
    },
  );
}
