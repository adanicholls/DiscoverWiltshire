import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// next/font replaces the old <link> to Google Fonts from the static
// prototype — same two typefaces (Fraunces for headlines/"voice"
// moments, Inter for everything else), just self-hosted and optimised.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Discover Wiltshire — the county's favourites, ranked by the people who live here",
  description:
    "The friend who knows Wiltshire best — every pub, stay, activity, shop, and local trade in the county, ranked by the people who actually use them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
