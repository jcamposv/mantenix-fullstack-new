import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, UserService } from "@/server"
import { updateUserSchema } from "../../../schemas/user-schemas"

// GET /api/admin/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const user = await UserService.getById(id, sessionResult)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user as unknown as Record<string, unknown> & { password?: string }
    return NextResponse.json(userResponse)

  } catch (error) {
    if (error instanceof Error && error.message === "Rol no autorizado para gestionar usuarios") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const updatedUser = await UserService.update(id, validatedData, sessionResult)
    
    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = updatedUser as unknown as Record<string, unknown> & { password?: string }
    return NextResponse.json(userResponse)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para actualizar usuarios") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Ya existe un usuario con este email") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes("No puedes asignar")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const deletedUser = await UserService.delete(id, sessionResult)
    
    if (!deletedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Usuario eliminado exitosamente",
      id 
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para eliminar usuarios") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No puedes eliminar tu propio usuario") {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}