import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-arabic",
});

export const metadata: Metadata = {
  title: "TALAQ | إدارة الدعم",
  description: "مساحة واحدة لتنظيم طلبات الدعم ومتابعتها حتى الحل.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}