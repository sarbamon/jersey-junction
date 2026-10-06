import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jersey Junction | Authentic Quality Football Jerseys & Custom Kits",
  description: "Your official destination for authentic football jerseys, NBA swingman kits, retro classics, and custom name printing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/hero/colin-meg-R8ayF9Qwu5Y-unsplash.webp" />
        <link rel="preload" as="image" href="/hero/cristian-tarzi-uBgmduO_ZBg-unsplash.webp" />
        <link rel="preload" as="image" href="/hero/simon-reza-Yfv7JszxYyw-unsplash.webp" />
        <link rel="preload" as="image" href="/hero/bibesh-manandhar-e-OfH1yh_hs-unsplash.webp" />
        <link rel="preload" as="image" href="/hero/michael-kyule-Lhd0RRDTTOo-unsplash.webp" />
        <link rel="preload" as="image" href="/hero/vladislav-glukhotko-HPDtJ0V_cNI-unsplash.webp" />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-[#f4c84a] selection:text-black">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
