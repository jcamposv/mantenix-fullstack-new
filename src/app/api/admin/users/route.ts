import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Role } from "@prisma/client"
import { AuthService, UserService } from "@/server"
import { createUserSchema, userFiltersSchema } from "../../schemas/user-schemas"
import bcrypt from "bcrypt"

export const dynamic = 'force-dynamic'

// GET /api/admin/users - Obtener usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { role, companyId, clientCompanyId, siteId, isActive, search, page, limit } = userFiltersSchema.parse(queryParams)

    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const filters = { role: role as Role | undefined, companyId, clientCompanyId, siteId, isActive, search }
    const result = await UserService.getList(sessionResult, filters, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para ver usuarios") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const userData = {
      ...validatedData,
      password: hashedPassword
    }

    const user = await UserService.create(userData, sessionResult)
    
    // Return user without password and include temp password for setup
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user as unknown as Record<string, unknown> & { password?: string }
    return NextResponse.json({
      ...userResponse,
      tempPassword // Include for initial setup
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para crear usuarios") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Ya existe un usuario con este email") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes("No puedes asignar")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}