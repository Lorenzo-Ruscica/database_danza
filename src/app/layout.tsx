import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background`}>
        {children}
      </body>
    </html>
  );
}
