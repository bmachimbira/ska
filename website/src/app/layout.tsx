import type { Metadata } from "next";
import { Raleway, Oswald, Noto_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const notoSerif = Noto_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKA Zimbabwe - Zimbabwe Conference of Sabbath Keeping Adventists",
  description: "Access sermons, daily devotionals, and Sabbath School lessons. Proclaiming the Three Angels' Messages and preparing for Christ's imminent return.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raleway.variable} ${oswald.variable} ${notoSerif.variable}`}>
      <body className="antialiased flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <OnboardingModal />
      </body>
    </html>
  );
}
