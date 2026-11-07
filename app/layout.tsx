import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { OPENING } from "@/lib/looks";
import "./globals.css";

const spatialBoot = `(function(){var root=document.documentElement;root.classList.add("js");var reduce=false;var ok=false;try{reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;ok=!!(window.CSS&&CSS.supports&&CSS.supports("transform","translate3d(0,0,0)")&&CSS.supports("perspective","1200px"));}catch(e){}if(!reduce&&ok)root.classList.add("spatial");if(window.innerHeight<520)root.classList.add("flat");})();`;

const sans = Geist({
  subsets: ["latin"],
  weight: ["100", "200"],
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
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <Script id="spatial-boot" strategy="beforeInteractive">
          {spatialBoot}
        </Script>
        <a className="skip" href="#top">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
