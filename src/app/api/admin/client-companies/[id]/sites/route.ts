import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: clientCompanyId } = params

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

    // Validate client company exists and user has access
    let clientCompanyWhereClause: any = { 
      id: clientCompanyId,
      isActive: true 
    }

    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      clientCompanyWhereClause.tenantCompanyId = session.user.companyId
    }

    const clientCompany = await prisma.clientCompany.findFirst({
      where: clientCompanyWhereClause
    })

    if (!clientCompany) {
      return NextResponse.json({ 
        error: "Client company not found or access denied" 
      }, { status: 404 })
    }

    // Fetch sites for this client company
    const sites = await prisma.site.findMany({
      where: {
        clientCompanyId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        contactName: true,
        timezone: true,
        createdAt: true,
        _count: {
          select: {
            siteUsers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error("Error fetching sites for client company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}