import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Gestionale Scuola di Ballo",
  description: "Sistema di gestione per l'Associazione Sportiva Dilettantistica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
