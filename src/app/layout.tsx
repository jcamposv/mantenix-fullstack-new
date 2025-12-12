import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { CompanyRepository } from "@/server/repositories/company.repository";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Mark as dynamic since we use headers() for subdomain detection
export const dynamic = 'force-dynamic'

/**
 * Generate dynamic metadata based on subdomain branding
 * Uses Repository pattern - Server Components can call Repository directly
 */
export async function generateMetadata(): Promise<Metadata> {
  // Default values
  let companyName = "MantenIX"
  let companyLogo = "/favicon.ico"

  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const subdomain = host.split('.')[0]

    // Only fetch if we have a valid subdomain
    if (subdomain && subdomain !== 'localhost' && subdomain !== host) {
      // Use Repository pattern (same as dashboard/mobile layouts)
      const branding = await CompanyRepository.findBrandingBySubdomain(subdomain)

      if (branding) {
        companyName = branding.name
        companyLogo = branding.logo || branding.logoSmall || "/favicon.ico"
      }
    }
  } catch (error) {
    console.warn('Failed to fetch company branding for metadata:', error)
  }

  return {
    title: {
      default: `${companyName} - Sistema de Gestión`,
      template: `%s | ${companyName}`
    },
    description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo, gestiona activos y mejora la eficiencia operativa de tu empresa.",
    keywords: ["mantenimiento", "gestión", "órdenes de trabajo", "CMMS", "activos", "mantenimiento preventivo", "mantenimiento correctivo"],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: companyLogo, sizes: "any" },
      ],
      shortcut: companyLogo,
      apple: companyLogo, // Dynamic apple-touch-icon for iOS PWA
    },
    manifest: "/api/manifest",
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: companyName,
      title: `${companyName} - Sistema de Gestión de Mantenimiento`,
      description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo, gestiona activos y mejora la eficiencia operativa.",
      images: [
        {
          url: companyLogo,
          width: 1200,
          height: 630,
          alt: `${companyName} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Sistema de Gestión de Mantenimiento`,
      description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo y gestiona activos.",
      images: [companyLogo],
    },
  }
}

/**
 * Generate viewport configuration including dynamic theme color
 */
export async function generateViewport(): Promise<Viewport> {
  let themeColor = "#000000"

  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const subdomain = host.split('.')[0]

    // Only fetch if we have a valid subdomain
    if (subdomain && subdomain !== 'localhost' && subdomain !== host) {
      const branding = await CompanyRepository.findBrandingBySubdomain(subdomain)

      if (branding?.primaryColor) {
        themeColor = branding.primaryColor
      }
    }
  } catch (error) {
    console.warn('Failed to fetch company branding for viewport:', error)
  }

  return {
    themeColor: themeColor,
  }
}

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
