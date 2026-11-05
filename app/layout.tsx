import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Pihu Ojha — Engineering student & builder", template: "%s | Pihu Ojha" },
  description: "Portfolio of Pihu Ojha: projects, hackathons, skills and education.",
  openGraph: { title: "Pihu Ojha — Portfolio", description: "Projects, hackathons, skills and education.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#09090d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
