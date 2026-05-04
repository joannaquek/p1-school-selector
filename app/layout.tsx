import type { Metadata } from "next";
import { Lexend, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-family-display"
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-family-body"
});

export const metadata: Metadata = {
  title: "P1 School Selector",
  description: "Shortlist primary schools for Singapore P1 registration"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${nunito.variable}`}>
        <a className="skipLink" href="#main-content">
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
