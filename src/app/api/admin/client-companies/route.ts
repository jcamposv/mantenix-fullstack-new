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

    // Check if user can view client companies (Super Admin or Company Admin)
    const canViewClientCompanies = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewClientCompanies) {
      return NextResponse.json({ 
        error: "Prohibido - Solo los super administradores o administradores de empresa pueden ver las empresas cliente" 
      }, { status: 403 })
    }

    // Build query based on user role
    let whereClause = {}
    if (session.user.role === "ADMIN_EMPRESA") {
      // Company admins can only see client companies from their own company
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause = { tenantCompanyId: session.user.companyId }
    }
    // Super admins can see all client companies (no where clause needed)

    // Fetch client companies
    const clientCompanies = await prisma.clientCompany.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      include: {
        tenantCompany: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clientCompanies)
  } catch (error) {
    console.error("Error fetching client companies:", error)
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

    // Check if user can create client companies (Super Admin or Company Admin)
    const canCreateClientCompanies = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canCreateClientCompanies) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can create client companies" 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      companyId,
      logo,
      address,
      phone,
      email,
      contactName,
      latitude,
      longitude,
      notes,
      tenantCompanyId
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la empresa es requerido" },
        { status: 400 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "La cédula jurídica es requerida" },
        { status: 400 }
      )
    }

    if (!address) {
      return NextResponse.json(
        { error: "La dirección es requerida" },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: "El teléfono es requerido" },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      )
    }

    if (!contactName) {
      return NextResponse.json(
        { error: "El nombre del contacto es requerido" },
        { status: 400 }
      )
    }

    // For company admins, ensure they can only create client companies for their own company
    let targetTenantCompanyId = tenantCompanyId
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json(
          { error: "Admin user has no associated company" },
          { status: 400 }
        )
      }
      // Company admins can only create client companies for their own company
      targetTenantCompanyId = session.user.companyId
    }

    // Super admins must specify a company
    if (session.user.role === "SUPER_ADMIN" && !targetTenantCompanyId) {
      return NextResponse.json(
        { error: "Company is required for client company creation" },
        { status: 400 }
      )
    }

    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: targetTenantCompanyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      )
    }

    // Create client company
    const clientCompany = await prisma.clientCompany.create({
      data: {
        name,
        companyId,
        logo,
        address,
        phone,
        email,
        contactName,
        latitude: latitude && latitude !== "" ? parseFloat(latitude as string) : null,
        longitude: longitude && longitude !== "" ? parseFloat(longitude as string) : null,
        notes,
        tenantCompanyId: targetTenantCompanyId,
        createdBy: session.user.id
      },
      include: {
        tenantCompany: {
          select: {
            id: true,
            name: true,
            subdomain: true
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

    return NextResponse.json(clientCompany, { status: 201 })
  } catch (error) {
    console.error("Error creating client company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}