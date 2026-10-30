import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

const title = "Jakob Alex";
const description =
  "Jakob Alex builds software in Berlin that shows its sources and checks its own answers.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jakobalex.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://jakobalex.vercel.app",
    siteName: "Jakob Alex",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8e0d2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
