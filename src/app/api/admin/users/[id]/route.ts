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

    // Check if user can view users
    const canViewUsers = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canViewUsers) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can view users" 
      }, { status: 403 })
    }

    // Build query based on user role
    let whereClause: any = { id }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.companyId = session.user.companyId
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
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

    const canUpdateUsers = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canUpdateUsers) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can update users" 
      }, { status: 403 })
    }

    // Verify user exists and user has access
    let whereClause: any = { id }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.companyId = session.user.companyId
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent users from editing themselves to avoid lockout
    if (existingUser.id === session.user.id) {
      return NextResponse.json({ 
        error: "No puedes editar tu propio usuario. Contacta a otro administrador." 
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      email,
      role,
      companyId,
      timezone,
      locale
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "El nombre y email son requeridos" },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const emailExists = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: "El email ya está en uso por otro usuario" },
        { status: 400 }
      )
    }

    // For company admins, validate role restrictions
    if (session.user.role === "ADMIN_EMPRESA") {
      // Company admins cannot assign super admin or other company admin roles
      if (role === "SUPER_ADMIN" || role === "ADMIN_EMPRESA") {
        return NextResponse.json(
          { error: "Los administradores de empresa no pueden asignar roles de super administrador o administrador de empresa" },
          { status: 403 }
        )
      }
      
      // Company admins can only assign users to their own company
      if (companyId && companyId !== session.user.companyId) {
        return NextResponse.json(
          { error: "Solo puedes asignar usuarios a tu propia empresa" },
          { status: 403 }
        )
      }
    }

    // Validate company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {
        return NextResponse.json(
          { error: "Empresa no encontrada" },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role || existingUser.role,
        companyId: companyId || existingUser.companyId,
        timezone: timezone || existingUser.timezone,
        locale: locale || existingUser.locale,
        updatedAt: new Date()
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

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
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

    const canDeleteUsers = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN_EMPRESA"
    if (!canDeleteUsers) {
      return NextResponse.json({ 
        error: "Forbidden - Only administrators can delete users" 
      }, { status: 403 })
    }

    // Verify user exists and user has access
    let whereClause: any = { id }
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Admin user has no associated company" }, { status: 400 })
      }
      whereClause.companyId = session.user.companyId
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause,
      include: {
        createdByUser: true,
        siteUsers: true
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent users from deleting themselves
    if (existingUser.id === session.user.id) {
      return NextResponse.json({ 
        error: "No puedes desactivar tu propio usuario" 
      }, { status: 400 })
    }

    // Check if user has site assignments
    if (existingUser.siteUsers.length > 0) {
      return NextResponse.json({ 
        error: "No se puede desactivar un usuario asignado a sedes. Primero reasigne a otro usuario o remueva de todas las sedes." 
      }, { status: 400 })
    }

    // Check for pending invitations created by this user
    const pendingInvitations = await prisma.userInvitation.count({
      where: {
        createdByUserId: id,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (pendingInvitations > 0) {
      return NextResponse.json({ 
        error: "No se puede desactivar un usuario con invitaciones pendientes. Primero cancele todas las invitaciones." 
      }, { status: 400 })
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: "Usuario desactivado exitosamente",
      id 
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}