import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Find the invitation
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            primaryColor: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      )
    }

    // Check if invitation has already been used
    if (invitation.used) {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 410 }
      )
    }

    // Return invitation details
    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      company: invitation.company,
      invitedBy: invitation.creator,
      expiresAt: invitation.expiresAt
    })

  } catch (error) {
    console.error("Error verifying invitation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}