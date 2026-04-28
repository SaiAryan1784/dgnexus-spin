import type { Metadata } from "next";
import { Inter, Righteous } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const righteous = Righteous({
  weight: '400',
  variable: "--font-righteous",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Data Gen AI Nexus 7.0 — GDG Noida",
  description:
    "Spin the wheel and unlock your registration discount for Data Gen AI Nexus 7.0 by GDG Noida.",
  openGraph: {
    title: "Data Gen AI Nexus 7.0 — GDG Noida",
    description: "Where Data Meets Generative Intelligence",
    images: ["/event-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${righteous.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-base text-ink antialiased" style={{ fontFamily: "Righteous, system-ui, sans-serif" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
