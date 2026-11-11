import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { OPENING } from "@/lib/copy";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  display: "swap",
  variable: "--font-sans",
  adjustFontFallback: true,
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-mono",
  adjustFontFallback: true,
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-serif",
  adjustFontFallback: true,
});

const title = "Jakob Alex";

export const metadata: Metadata = {
  metadataBase: new URL("https://jakobalex.vercel.app"),
  title,
  description: OPENING,
  openGraph: {
    title,
    description: OPENING,
    url: "https://jakobalex.vercel.app",
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description: OPENING,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <a className="skip" href="#top">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
