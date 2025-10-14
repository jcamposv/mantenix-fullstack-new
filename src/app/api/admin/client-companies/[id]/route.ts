import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can view client companies
    const canViewClientCompanies = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewClientCompanies) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can view client companies" 
      }, { status: 403 })
    }

    // Find client company
    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: params.id },
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

    if (!clientCompany) {
      return NextResponse.json({ error: "Client company not found" }, { status: 404 })
    }

    // Company admins can only see client companies from their own company
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId || clientCompany.tenantCompanyId !== session.user.companyId) {
        return NextResponse.json({ error: "Forbidden - Access denied" }, { status: 403 })
      }
    }

    return NextResponse.json(clientCompany)
  } catch (error) {
    console.error("Error fetching client company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can update client companies
    const canUpdateClientCompanies = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canUpdateClientCompanies) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can update client companies" 
      }, { status: 403 })
    }

    // Find existing client company
    const existingClientCompany = await prisma.clientCompany.findUnique({
      where: { id: params.id }
    })

    if (!existingClientCompany) {
      return NextResponse.json({ error: "Client company not found" }, { status: 404 })
    }

    // Company admins can only update client companies from their own company
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId || existingClientCompany.tenantCompanyId !== session.user.companyId) {
        return NextResponse.json({ error: "Forbidden - Access denied" }, { status: 403 })
      }
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
      notes
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

    // Update client company
    const updatedClientCompany = await prisma.clientCompany.update({
      where: { id: params.id },
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
        updatedAt: new Date()
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

    return NextResponse.json(updatedClientCompany)
  } catch (error) {
    console.error("Error updating client company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can delete client companies
    const canDeleteClientCompanies = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canDeleteClientCompanies) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can delete client companies" 
      }, { status: 403 })
    }

    // Find existing client company with related data
    const existingClientCompany = await prisma.clientCompany.findUnique({
      where: { id: params.id },
      include: {
        sites: { where: { isActive: true } },
        users: { where: { isExternalUser: true } }
      }
    })

    if (!existingClientCompany) {
      return NextResponse.json({ error: "Client company not found" }, { status: 404 })
    }

    // Company admins can only delete client companies from their own company
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId || existingClientCompany.tenantCompanyId !== session.user.companyId) {
        return NextResponse.json({ error: "Forbidden - Access denied" }, { status: 403 })
      }
    }

    // Check if there are active sites
    if (existingClientCompany.sites.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una empresa cliente con sedes activas. Primero desactive todas las sedes." 
      }, { status: 400 })
    }

    // Check if there are external users
    if (existingClientCompany.users.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una empresa cliente con usuarios externos. Primero elimine todos los usuarios externos." 
      }, { status: 400 })
    }

    // Soft delete (set isActive to false and deletedAt timestamp)
    const deletedClientCompany = await prisma.clientCompany.update({
      where: { id: params.id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: "Empresa cliente desactivada exitosamente",
      id: deletedClientCompany.id 
    })
  } catch (error) {
    console.error("Error deleting client company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}