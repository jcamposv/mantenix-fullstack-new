/**
 * PWA Manifest Service
 *
 * Business logic for generating dynamic PWA manifests
 * based on company branding
 */

import { CompanyRepository } from "@/server/repositories/company.repository"

interface ManifestIcon {
  src: string
  sizes: string
  type: string
  purpose?: string
}

export interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: string
  background_color: string
  theme_color: string
  orientation: string
  icons: ManifestIcon[]
  categories: string[]
  lang: string
  dir: string
}

/**
 * Service for generating dynamic PWA manifests
 */
export class PWAManifestService {
  /**
   * Generate manifest based on subdomain branding
   */
  static async generateManifest(subdomain: string | null): Promise<PWAManifest> {
    // Default MantenIX manifest
    if (!subdomain) {
      return this.getDefaultManifest()
    }

    try {
      // Get company branding from repository
      const branding = await CompanyRepository.findBrandingBySubdomain(subdomain)

      if (!branding) {
        return this.getDefaultManifest()
      }

      // Generate branded manifest
      return this.getBrandedManifest(branding, subdomain)
    } catch (error) {
      console.error("Error generating branded manifest:", error)
      return this.getDefaultManifest()
    }
  }

  /**
   * Get default MantenIX manifest
   */
  private static getDefaultManifest(): PWAManifest {
    return {
      name: "MantenIX - Sistema de Gestión de Mantenimiento",
      short_name: "MantenIX",
      description: "Sistema completo de gestión de mantenimiento. Optimiza órdenes de trabajo, gestiona activos y mejora la eficiencia operativa.",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon"
        },
        {
          src: "/images/mantenix-logo-black.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "/api/icon?size=192",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/api/icon?size=512",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      categories: ["productivity", "business", "utilities"],
      lang: "es",
      dir: "ltr"
    }
  }

  /**
   * Get branded manifest for specific company
   */
  private static getBrandedManifest(
    branding: { name: string; logo?: string | null; logoSmall?: string | null; primaryColor?: string; backgroundColor?: string },
    subdomain: string
  ): PWAManifest {
    return {
      name: `${branding.name} - Sistema de Gestión`,
      short_name: branding.name,
      description: `Sistema de gestión de mantenimiento para ${branding.name}`,
      start_url: "/",
      display: "standalone",
      background_color: branding.backgroundColor || "#ffffff",
      theme_color: branding.primaryColor || "#000000",
      orientation: "portrait-primary",
      icons: [
        // Use company logo if available
        ...(branding.logo ? [{
          src: branding.logo,
          sizes: "any",
          type: this.getImageType(branding.logo),
          purpose: "any maskable" as const
        }] : []),
        // Use company small logo if available
        ...(branding.logoSmall ? [{
          src: branding.logoSmall,
          sizes: "any",
          type: this.getImageType(branding.logoSmall),
          purpose: "any"
        }] : []),
        // Dynamic icon endpoint with company branding
        {
          src: `/api/icon?subdomain=${subdomain}&size=192`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: `/api/icon?subdomain=${subdomain}&size=512`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        },
        // Fallback to favicon
        {
          src: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon"
        }
      ],
      categories: ["productivity", "business", "utilities"],
      lang: "es",
      dir: "ltr"
    }
  }

  /**
   * Detect image type from URL
   */
  private static getImageType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'svg':
        return 'image/svg+xml'
      case 'png':
        return 'image/png'
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'webp':
        return 'image/webp'
      default:
        return 'image/png'
    }
  }

  /**
   * Extract subdomain from host header
   * Uses the same logic as dashboard/mobile layouts for consistency
   */
  static extractSubdomain(host: string): string | null {
    try {
      // Remove port if present
      const hostname = host.split(':')[0]

      // Extract first part (subdomain)
      const subdomain = hostname.split('.')[0]

      // Only return if we have a subdomain (not just localhost or the full host)
      if (subdomain && subdomain !== 'localhost' && subdomain !== hostname) {
        return subdomain
      }

      return null
    } catch (error) {
      console.error("Error extracting subdomain:", error)
      return null
    }
  }
}
