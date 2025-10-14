/**
 * Dynamic Branding API for Multi-tenant Architecture
 * 
 * Returns company branding configuration based on subdomain
 * Supports caching for performance
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 5 * 60

interface BrandingResponse {
  id: string
  name: string
  subdomain: string
  logo?: string
  logoSmall?: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  customFont?: string
  tier: string
}

/**
 * GET /api/branding
 * Returns branding configuration for the current company
 */
export async function GET(request: NextRequest) {
  try {
    // Get subdomain from headers (set by middleware) or extract from request
    const headersList = await headers()
    const subdomain = headersList.get("x-subdomain") || extractSubdomainFromUrl(request.url)
    
    if (!subdomain) {
      return NextResponse.json(
        { error: "No subdomain provided" },
        { status: 400 }
      )
    }
    
    // Query company by subdomain
    const company = await prisma.company.findUnique({
      where: {
        subdomain,
        isActive: true, // Only return active companies
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        logoSmall: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        customFont: true,
        tier: true,
      },
    })
    
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }
    
    // Transform to response format
    const brandingResponse: BrandingResponse = {
      id: company.id,
      name: company.name,
      subdomain: company.subdomain,
      logo: company.logo || undefined,
      logoSmall: company.logoSmall || undefined,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      backgroundColor: company.backgroundColor,
      customFont: company.customFont || undefined,
      tier: company.tier,
    }
    
    // Create response with caching headers
    const response = NextResponse.json(brandingResponse)
    
    // Set cache headers for performance
    response.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION * 2}`
    )
    response.headers.set("ETag", `"${company.id}-${company.subdomain}"`)
    
    // Add CORS headers for subdomain access
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    
    return response
    
  } catch (error) {
    console.error("Error fetching branding:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/branding
 * Updates branding configuration (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Get user context from headers (set by middleware)
    const headersList = await headers()
    const userId = headersList.get("x-user-id")
    const userRole = headersList.get("x-user-role")
    const companyId = headersList.get("x-company-id")
    
    // Check if user is authorized to update branding
    if (!userId || !userRole || !companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN_EMPRESA") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate branding data
    const validatedData = validateBrandingData(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid branding data", details: validatedData.errors },
        { status: 400 }
      )
    }
    
    // Update company branding
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: validatedData.data,
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        logoSmall: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        customFont: true,
        tier: true,
      },
    })
    
    // TODO: Create audit log for branding update
    // await auditCompanyAction(companyId, userId, 'branding_updated', ...)
    
    return NextResponse.json({
      message: "Branding updated successfully",
      company: updatedCompany,
    })
    
  } catch (error) {
    console.error("Error updating branding:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract subdomain from full URL
 */
function extractSubdomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // Development - localhost
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      const parts = hostname.split(".")
      if (parts.length > 1 && parts[0] !== "www") {
        return parts[0]
      }
      return null
    }
    
    // Production - mantenix.ai
    if (hostname.includes("mantenix.ai")) {
      const parts = hostname.split(".")
      if (parts.length > 2 && parts[0] !== "www") {
        return parts[0]
      }
    }
    
    return null
  } catch (error) {
    console.error("Error extracting subdomain:", error)
    return null
  }
}

/**
 * Validate branding data
 */
function validateBrandingData(data: any): {
  success: boolean
  data?: any
  errors?: string[]
} {
  const errors: string[] = []
  const validatedData: any = {}
  
  // Validate logo URLs
  if (data.logo) {
    if (!isValidUrl(data.logo)) {
      errors.push("Invalid logo URL")
    } else {
      validatedData.logo = data.logo
    }
  }
  
  if (data.logoSmall) {
    if (!isValidUrl(data.logoSmall)) {
      errors.push("Invalid small logo URL")
    } else {
      validatedData.logoSmall = data.logoSmall
    }
  }
  
  // Validate color formats (hex colors)
  if (data.primaryColor) {
    if (!isValidHexColor(data.primaryColor)) {
      errors.push("Invalid primary color format")
    } else {
      validatedData.primaryColor = data.primaryColor
    }
  }
  
  if (data.secondaryColor) {
    if (!isValidHexColor(data.secondaryColor)) {
      errors.push("Invalid secondary color format")
    } else {
      validatedData.secondaryColor = data.secondaryColor
    }
  }
  
  if (data.backgroundColor) {
    if (!isValidHexColor(data.backgroundColor)) {
      errors.push("Invalid background color format")
    } else {
      validatedData.backgroundColor = data.backgroundColor
    }
  }
  
  // Validate custom font
  if (data.customFont) {
    if (typeof data.customFont !== "string" || data.customFont.length > 50) {
      errors.push("Invalid custom font name")
    } else {
      validatedData.customFont = data.customFont
    }
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? validatedData : undefined,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}