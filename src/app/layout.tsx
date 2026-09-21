import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// The site is now styled to resemble producthunt.com, which uses no
// custom webfont at all (plain system-ui/-apple-system/Segoe UI) - Inter
// is close enough to that look to keep as the one loaded family, self-
// hosted and optimised via next/font. Fraunces (the old serif "voice"
// font) has been dropped entirely: --font-voice in globals.css now just
// points at this same stack, so nothing references it anymore.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Discover Wiltshire — the county's favourites, ranked by the people who live here",
  description:
    "The friend who knows Wiltshire best — every pub, stay, activity, shop, and local trade in the county, ranked by the people who actually use them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
