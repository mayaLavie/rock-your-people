import type { Metadata } from "next";
import {
  Bebas_Neue,
  Bowlby_One_SC,
  Inter,
  Rubik,
  Varela_Round,
} from "next/font/google";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import "./globals.css";

const bowlby = Bowlby_One_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bowlby",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["hebrew", "latin"],
  variable: "--font-varela",
});

export const metadata: Metadata = {
  title: "Rock Your People",
  description: "חוויות מוזיקליות אינטראקטיביות לחברות, צוותים ואירועים",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bowlby.variable} ${inter.variable} ${bebasNeue.variable} ${rubik.variable} ${varelaRound.variable} min-h-full bg-background font-sans text-foreground antialiased`}
      >
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
