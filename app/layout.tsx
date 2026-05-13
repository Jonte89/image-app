import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Image Mixer",
  description: "Blend two images into one using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans bg-cream text-ink">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
