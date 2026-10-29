import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PAGE_TITLE } from "@/lib/copy";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jakobalex.vercel.app"),
  title: PAGE_TITLE,
  description: PAGE_TITLE,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_TITLE,
    url: "https://jakobalex.vercel.app",
    siteName: "Jakob Alex",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_TITLE,
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
