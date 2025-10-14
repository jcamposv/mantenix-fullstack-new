import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    const { name, password } = body

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Find and validate invitation
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        company: true,
        clientCompany: true,
        site: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      )
    }

    if (invitation.used) {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 410 }
      )
    }

    // Check if user already exists (shouldn't happen, but safety check)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Create user using Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: invitation.email,
        password: password,
        name: name,
      },
    })

    if (!result.user) {
      throw new Error("Failed to create user account")
    }

    // Update user with role and company from invitation
    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        emailVerified: true,
        role: invitation.role,
        companyId: invitation.companyId,
        isExternalUser: invitation.isExternalUser,
        clientCompanyId: invitation.clientCompanyId,
        siteId: invitation.siteId,
      },
    })

    // Mark invitation as used
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    })

    // Create audit log
    if (invitation.companyId) {
      await prisma.auditLog.create({
        data: {
          companyId: invitation.companyId,
          userId: updatedUser.id,
          action: "USER_INVITATION_ACCEPTED",
          resource: "USER",
          resourceId: updatedUser.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || '',
          details: `User accepted invitation for role ${invitation.role}${invitation.isExternalUser ? ` (external user for ${invitation.clientCompany?.name}${invitation.site ? ` - ${invitation.site.name}` : ''})` : ''}`,
        }
      })
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        company: invitation.company,
        isExternalUser: updatedUser.isExternalUser,
        clientCompany: invitation.clientCompany,
        site: invitation.site
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}