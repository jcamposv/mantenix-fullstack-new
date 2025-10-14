import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user can view users (Super Admin or Company Admin)
    const canViewUsers = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewUsers) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can view users" 
      }, { status: 403 })
    }

    // Build query based on user role
    let whereClause = {}
    if (session.user.role === "ADMIN_EMPRESA") {
      // Company admins can only see users from their own company
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause = { companyId: session.user.companyId }
    }

    // Fetch users with company information
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
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

    // Check if user can create users (Super Admin or Company Admin)
    const canCreateUsers = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canCreateUsers) {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins or company admins can create users" 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role = "TECNICO",
      companyId,
      timezone = "UTC",
      locale = "en"
    } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // For company admins, ensure they can only create users for their own company
    let targetCompanyId = companyId
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json(
          { error: "Admin user has no associated company" },
          { status: 400 }
        )
      }
      
      // Company admins can only create users for their own company
      targetCompanyId = session.user.companyId
      
      // Company admins cannot create super admins or other company admins
      if (role === "SUPER_ADMIN" || role === "ADMIN_EMPRESA") {
        return NextResponse.json(
          { error: "Company admins cannot create super admins or other company admins" },
          { status: 403 }
        )
      }
    }

    // Super admins must specify a company for non-super-admin roles
    if (session.user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && !targetCompanyId) {
      return NextResponse.json(
        { error: "Company is required for non-super-admin roles" },
        { status: 400 }
      )
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Validate company exists if provided
    if (targetCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: targetCompanyId }
      })

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user with profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        // Note: Better Auth handles the password separately
        companyId: targetCompanyId,
        role,
        timezone,
        locale,
        preferences: "{}",
        mfaEnabled: false
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    })

    // Create Better Auth account separately
    // This is a simplified approach - in production you might want to use Better Auth's user creation API
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email,
        providerId: "credential",
        password: hashedPassword,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}