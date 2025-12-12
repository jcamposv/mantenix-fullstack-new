/**
 * Dynamic PWA Icon API Route
 *
 * Serves dynamic icons based on company branding
 * Falls back to MantenIX default icon if no branding found
 */

import { NextRequest, NextResponse } from "next/server"
import { CompanyRepository } from "@/server/repositories/company.repository"
import { PWAManifestService } from "@/server/services/pwa-manifest.service"

export const dynamic = 'force-dynamic'

/**
 * GET /api/icon
 * Returns icon based on subdomain branding
 * Query params:
 *  - subdomain: optional subdomain override
 *  - size: requested icon size (192, 512, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomainParam = searchParams.get("subdomain")
    const size = searchParams.get("size") || "512"

    // Determine subdomain
    let subdomain = subdomainParam
    if (!subdomain) {
      const host = request.headers.get("host") || ""
      subdomain = PWAManifestService.extractSubdomain(host)
    }

    // If no subdomain, redirect to default MantenIX logo
    if (!subdomain) {
      return NextResponse.redirect(new URL("/images/mantenix-logo-black.svg", request.url))
    }

    // Get company branding
    const branding = await CompanyRepository.findBrandingBySubdomain(subdomain)

    if (!branding) {
      // No branding found, use default
      return NextResponse.redirect(new URL("/images/mantenix-logo-black.svg", request.url))
    }

    // Determine which logo to use based on size
    const logo = size === "192" && branding.logoSmall
      ? branding.logoSmall
      : branding.logo || branding.logoSmall

    if (!logo) {
      // No logo configured, use default
      return NextResponse.redirect(new URL("/images/mantenix-logo-black.svg", request.url))
    }

    // If logo is external URL, redirect to it
    if (logo.startsWith("http://") || logo.startsWith("https://")) {
      return NextResponse.redirect(logo)
    }

    // If logo is internal path, redirect to it
    return NextResponse.redirect(new URL(logo, request.url))

  } catch (error) {
    console.error("Error serving icon:", error)

    // On error, redirect to default logo
    return NextResponse.redirect(new URL("/images/mantenix-logo-black.svg", request.url))
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
