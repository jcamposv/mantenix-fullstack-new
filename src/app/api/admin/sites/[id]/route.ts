import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can view sites
    const canViewSites = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewSites) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can view sites" 
      }, { status: 403 })
    }

    // Build query based on user role
    let whereClause: any = { id, isActive: true }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.clientCompany = {
        tenantCompanyId: session.user.companyId 
      }
    }

    const site = await prisma.site.findFirst({
      where: whereClause,
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
        siteUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error("Error fetching site:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canUpdateSites = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canUpdateSites) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can update sites" 
      }, { status: 403 })
    }

    // Verify site exists and user has access
    let whereClause: any = { id, isActive: true }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.clientCompany = {
        tenantCompanyId: session.user.companyId 
      }
    }

    const existingSite = await prisma.site.findFirst({
      where: whereClause
    })

    if (!existingSite) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
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
      notes
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la sede es requerido" },
        { status: 400 }
      )
    }

    // Update site
    const updatedSite = await prisma.site.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        contactName,
        latitude: latitude && latitude !== "" ? parseFloat(latitude as string) : null,
        longitude: longitude && longitude !== "" ? parseFloat(longitude as string) : null,
        timezone: timezone || existingSite.timezone,
        notes,
        updatedAt: new Date()
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

    return NextResponse.json(updatedSite)
  } catch (error) {
    console.error("Error updating site:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const canDeleteSites = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canDeleteSites) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can delete sites" 
      }, { status: 403 })
    }

    // Verify site exists and user has access
    let whereClause: any = { id, isActive: true }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.clientCompany = {
        tenantCompanyId: session.user.companyId 
      }
    }

    const existingSite = await prisma.site.findFirst({
      where: whereClause,
      include: {
        siteUsers: true
      }
    })

    if (!existingSite) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Check if site has users assigned
    if (existingSite.siteUsers.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una sede con usuarios asignados. Primero reasigne o elimine todos los usuarios." 
      }, { status: 400 })
    }

    // Check for pending invitations
    const pendingInvitations = await prisma.userInvitation.count({
      where: {
        siteId: id,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (pendingInvitations > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una sede con invitaciones pendientes. Primero cancele todas las invitaciones." 
      }, { status: 400 })
    }

    // Soft delete the site
    await prisma.site.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: "Sede desactivada exitosamente",
      id 
    })
  } catch (error) {
    console.error("Error deleting site:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}