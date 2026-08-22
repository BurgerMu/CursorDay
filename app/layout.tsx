import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const display = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "SHOWUP — both of you confirm",
  description: "Mutual check-in. If one of you doesn't tap, Discord gets loud.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <div className="crt" aria-hidden />
        {children}
      </body>
    </html>
  );
}
