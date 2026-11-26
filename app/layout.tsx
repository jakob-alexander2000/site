import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, Martian_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-sans",
  adjustFontFallback: true,
});

const mono = Martian_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  adjustFontFallback: true,
});

const title = "Jakob Alex";
const description = "I build AI tools that show their working.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    type: "website",
    locale: "en",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
