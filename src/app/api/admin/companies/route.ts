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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden - Super Admin access required" }, { status: 403 })
    }

    // Fetch all companies with user count
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error fetching companies:", error)
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

    // Check if user is super admin
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden - Super Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      subdomain,
      tier = "STARTER",
      primaryColor = "#3b82f6",
      secondaryColor = "#64748b",
      backgroundColor = "#ffffff",
      logo = null,
      mfaEnforced = false,
      ipWhitelist = []
    } = body

    // Validate required fields
    if (!name || !subdomain) {
      return NextResponse.json(
        { error: "Name and subdomain are required" },
        { status: 400 }
      )
    }

    // Check if subdomain is already taken
    const existingCompany = await prisma.company.findUnique({
      where: { subdomain }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Subdomain already exists" },
        { status: 400 }
      )
    }

    // Create new company
    const company = await prisma.company.create({
      data: {
        name,
        subdomain,
        tier,
        primaryColor,
        secondaryColor,
        backgroundColor,
        logo,
        mfaEnforced,
        ipWhitelist,
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}