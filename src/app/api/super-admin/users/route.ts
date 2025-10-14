import { NextResponse } from "next/server"
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only super admins can access this endpoint
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins can view all users" 
      }, { status: 403 })
    }

    // Fetch all users with their companies and client companies
    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        clientCompany: {
          select: {
            id: true,
            name: true,
            contactName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      image: user.image,
      isExternalUser: user.isExternalUser,
      createdAt: user.createdAt.toISOString(),
      company: user.company,
      clientCompany: user.clientCompany
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}