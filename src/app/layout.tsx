import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Almarai } from "next/font/google";
import { Toaster } from "sonner";

const fontFamily = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "نادي كلمة المدرسي",
  description: "نادي كلمة المدرسي, تعلم أولاً",
  keywords:
    "نادي كلمة المدرسي, تعلم أولاً, المدرسة, المدرسين, المدرسين العالمية, المدرسين العالمية الحديثة, المدرسين العالمية الحديثة التعليمية",
  icons: {
    icon: "/favicon.ico",
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
