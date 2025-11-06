import { NextRequest, NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInviteEmail } from "@/lib/email"
import { headers } from "next/headers"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can invite users (Super Admin, Group Admin or Company Admin)
    const canInvite = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_GRUPO" || session.user.role === "ADMIN_EMPRESA"
    if (!canInvite) {
      return NextResponse.json({
        error: "Forbidden - Only administrators can invite users"
      }, { status: 403 })
    }

    const body = await request.json()
    const { email, role, companyId, name, isExternalUser, clientCompanyId, siteId, image } = body

    // Validate required fields
    if (!email || !role || !name) {
      return NextResponse.json(
        { error: "Email, role, and name are required" },
        { status: 400 }
      )
    }

    // Validate external user requirements
    if (isExternalUser && !clientCompanyId) {
      return NextResponse.json(
        { error: "Client company is required for external users" },
        { status: 400 }
      )
    }

    // Only require site for roles that need site-specific access
    const roleRequiresSite = role === "CLIENTE_ADMIN_SEDE" || role === "CLIENTE_OPERARIO"
    if (isExternalUser && roleRequiresSite && !siteId) {
      return NextResponse.json(
        { error: "Site is required for this role" },
        { status: 400 }
      )
    }

    // Validate client company belongs to the tenant (only for company/group admins)
    if (isExternalUser && clientCompanyId && (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO")) {
      if (!session.user.companyId) {
        return NextResponse.json(
          { error: "Admin user has no associated company" },
          { status: 400 }
        )
      }

      const clientCompany = await prisma.clientCompany.findFirst({
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
    }

    // Validate site belongs to the client company (when site is provided for external users)
    if (isExternalUser && siteId) {
      const site = await prisma.site.findFirst({
        where: {
          id: siteId,
          clientCompanyId: clientCompanyId,
          isActive: true
        }
      })

      if (!site) {
        return NextResponse.json(
          { error: "Site not found or does not belong to the selected client company" },
          { status: 400 }
        )
      }
    }

    // For company/group admins, ensure they can only invite to their own company
    let targetCompanyId = companyId
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        return NextResponse.json(
          { error: "Admin user has no associated company" },
          { status: 400 }
        )
      }
      targetCompanyId = session.user.companyId
    }

    // Super admins must specify a company for all roles except SUPER_ADMIN
    if (session.user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && !targetCompanyId) {
      return NextResponse.json(
        { error: "Company is required for this role" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.userInvitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 }
      )
    }

    // Get company info for email
    let company = null
    if (targetCompanyId) {
      company = await prisma.company.findUnique({
        where: { id: targetCompanyId }
      })

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 400 }
        )
      }
    }

    // Create invitation token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    // Create invitation record
    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        role: role as Role,
        companyId: targetCompanyId,
        isExternalUser: isExternalUser || false,
        clientCompanyId: isExternalUser ? clientCompanyId : null,
        siteId: isExternalUser && siteId ? siteId : null,
        image: image || null,
        token,
        expiresAt,
        createdBy: session.user.id
      },
      include: {
        company: true,
        creator: true,
        clientCompany: true,
        site: true
      }
    })

    // Send invitation email
    // Build URL with company subdomain if available
    let inviteLink
    if (company?.subdomain) {
      // Use company subdomain for tenant-specific invitation
      const domainBase = process.env.DOMAIN_BASE || "mantenix.com"
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${company.subdomain}.${domainBase}`
        : `http://${company.subdomain}.localhost:3000`
      inviteLink = `${baseUrl}/invite/${token}`
    } else {
      // Fallback to main domain for super admin invitations
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      inviteLink = `${baseUrl}/invite/${token}`
    }
    
    await sendInviteEmail({
      recipientEmail: email,
      recipientName: name,
      inviterName: session.user.name || "Administrator",
      companyName: company?.name || "Mantenix",
      role: role,
      inviteLink,
      companyId: targetCompanyId
    })

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        companyName: company?.name,
        expiresAt: invitation.expiresAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    )
  }
}