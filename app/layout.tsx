import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import { AuthModal } from "../components/AuthModal";
import { NewUserTutorial } from "../components/NewUserTutorial";

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
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-[hsl(16.9deg_39.66%_64.9%)] selection:text-white">
        <StoreProvider>
          {children}
          <AuthModal />
          <NewUserTutorial />
        </StoreProvider>
      </body>
    </html>
  );
}
