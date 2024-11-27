import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "sonner";

const fontFamily = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "نادي كلمة المدرسي",
  description: "نادي كلمة المدرسي, تعلم أولاً",
  keywords:
    "نادي كلمة المدرسي, تعلم أولاً, المدرسة, المدرسين, المدرسين العالمية, المدرسين العالمية الحديثة, المدرسين العالمية الحديثة التعليمية",
  openGraph: {
    type: "website",
    locale: "ar",
    url: "https://nadiyaklam.com", // TODO: Change this to your website URL
    title: "نادي كلمة المدرسي",
    description: "نادي كلمة المدرسي, تعلم أولاً",
    images: [
      {
        url: "https://nadiyaklam.com/og-image.png", // TODO: Replace with your own image URL
        width: 1200,
        height: 630,
        alt: "نادي كلمة المدرسي",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body className={`${fontFamily.className}`} dir="rtl">
        {children}
        <Toaster
          dir="rtl"
          position="bottom-left"
          style={{
            fontFamily: fontFamily.style.fontFamily,
          }}
          richColors={true}
        />
      </body>
    </html>
  );
}
