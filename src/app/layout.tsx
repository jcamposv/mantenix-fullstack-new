import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MantenIX - Sistema de Gestión de Mantenimiento",
    template: "%s | MantenIX"
  },
  description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo, gestiona activos y mejora la eficiencia operativa de tu empresa.",
  keywords: ["mantenimiento", "gestión", "órdenes de trabajo", "CMMS", "activos", "mantenimiento preventivo", "mantenimiento correctivo"],
  authors: [{ name: "MantenIX" }],
  creator: "MantenIX",
  publisher: "MantenIX",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.mantenix.com",
    siteName: "MantenIX",
    title: "MantenIX - Sistema de Gestión de Mantenimiento",
    description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo, gestiona activos y mejora la eficiencia operativa.",
    images: [
      {
        url: "/images/mantenix-logo-black.svg",
        width: 1200,
        height: 630,
        alt: "MantenIX Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MantenIX - Sistema de Gestión de Mantenimiento",
    description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo y gestiona activos.",
    images: ["/images/mantenix-logo-black.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
