import type { Metadata } from "next";
import "./globals.css";

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let platformName = "منصتك";
  let description = "منصة SaaS متكاملة لإنشاء متاجر إلكترونية للمطاعم والماركت والصيدليات. أنشئ متجرك واستقبل الطلبات برابط خاص بك.";
  let icon = "/favicon.ico";
  let image = "/favicon.ico";

  try {
    const settings = await prisma.platformSetting.findUnique({ where: { id: "1" } });
    if (settings) {
      if (settings.name) platformName = settings.name;
      if (settings.logo) {
        icon = settings.logo;
        image = settings.logo;
      }
    }
  } catch (e) {
    // Fallback if DB is not migrated
  }

  const title = `${platformName} - أنشئ متجرك الإلكتروني في دقائق`;

  return {
    title: title,
    description: description,
    icons: {
      icon: icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      title: title,
      description: description,
      siteName: platformName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: platformName,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [image],
    },
  };
}

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;700&family=Changa:wght@400;700&family=El+Messiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Lalezar&family=Readex+Pro:wght@400;700&family=Tajawal:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-cairo">
        <NextTopLoader color="#2563eb" showSpinner={false} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
