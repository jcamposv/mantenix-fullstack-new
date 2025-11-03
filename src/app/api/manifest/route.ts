/**
 * Dynamic PWA Manifest API Route
 *
 * Generates a dynamic manifest.json based on company branding
 */

import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { PWAManifestService } from "@/server/services/pwa-manifest.service"

export const dynamic = 'force-dynamic'

/**
 * GET /api/manifest
 * Returns dynamic PWA manifest.json based on subdomain/branding
 */
export async function GET(request: NextRequest) {
  try {
    // Extract subdomain using the SAME logic as dashboard/mobile layouts
    const headersList = await headers()
    const host = headersList.get("host") || ""

    // Simple extraction: first part of domain
    const subdomain = host.split('.')[0]

    // Only use subdomain if it's valid (not localhost or the full host)
    const validSubdomain = (subdomain && subdomain !== 'localhost' && subdomain !== host)
      ? subdomain
      : null

    console.log('[Manifest API] Host:', host, '| Subdomain:', validSubdomain)

    // Generate manifest using service
    const manifest = await PWAManifestService.generateManifest(validSubdomain)

    // Return manifest with proper headers
    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=60, s-maxage=120", // Cache for 1-2 minutes (reduced for testing)
      }
    })

  } catch (error) {
    console.error("Error in manifest API:", error)

    // Return default manifest on error using service
    const defaultManifest = await PWAManifestService.generateManifest(null)

    return NextResponse.json(defaultManifest, {
      headers: {
        "Content-Type": "application/manifest+json",
      }
    })
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
