import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check if user can view sites (Super Admin or Company Admin)
    const canViewSites = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewSites) {
      return NextResponse.json({ 
        error: "Prohibido - Solo los super administradores o administradores de empresa pueden ver las sedes" 
      }, { status: 403 })
    }

    // Build query based on user role
    let whereClause = {}
    if (session.user.role === "ADMIN_EMPRESA") {
      // Company admins can only see sites from client companies of their own company
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause = { 
        clientCompany: {
          tenantCompanyId: session.user.companyId 
        }
      }
    }
    // Super admins can see all sites (no where clause needed)

    // Fetch sites
    const sites = await prisma.site.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      include: {
        clientCompany: {
          select: {
            id: true,
            name: true,
            tenantCompany: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            siteUsers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error("Error fetching sites:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can create sites (Super Admin or Company Admin)
    const canCreateSites = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canCreateSites) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can create sites" 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      address,
      phone,
      email,
      contactName,
      latitude,
      longitude,
      timezone,
      notes,
      clientCompanyId
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la sede es requerido" },
        { status: 400 }
      )
    }

    if (!clientCompanyId) {
      return NextResponse.json(
        { error: "La empresa cliente es requerida" },
        { status: 400 }
      )
    }

    // Validate client company exists and belongs to user's tenant (for company admins)
    let clientCompany
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json(
          { error: "Admin user has no associated company" },
          { status: 400 }
        )
      }
      
      clientCompany = await prisma.clientCompany.findFirst({
        where: {
          id: clientCompanyId,
          tenantCompanyId: session.user.companyId,
          isActive: true
        }
      })

      if (!clientCompany) {
        return NextResponse.json(
          { error: "Client company not found or does not belong to your tenant" },
          { status: 400 }
        )
      }
    } else {
      // Super admins can create sites for any client company
      clientCompany = await prisma.clientCompany.findUnique({
        where: { id: clientCompanyId }
      })

      if (!clientCompany) {
        return NextResponse.json(
          { error: "Client company not found" },
          { status: 400 }
        )
      }
    }

    // Create site
    const site = await prisma.site.create({
      data: {
        name,
        address,
        phone,
        email,
        contactName,
        latitude: latitude && latitude !== "" ? parseFloat(latitude as string) : null,
        longitude: longitude && longitude !== "" ? parseFloat(longitude as string) : null,
        timezone: timezone || "UTC",
        notes,
        clientCompanyId,
        createdBy: session.user.id
      },
      include: {
        clientCompany: {
          select: {
            id: true,
            name: true,
            tenantCompany: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error("Error creating site:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}