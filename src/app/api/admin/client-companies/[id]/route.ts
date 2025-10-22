import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, ClientCompanyService } from "@/server"
import { updateClientCompanySchema } from "../../../schemas/client-company-schemas"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const clientCompany = await ClientCompanyService.getById(id, sessionResult)

    if (!clientCompany) {
      return NextResponse.json({ error: "Empresa cliente no encontrada" }, { status: 404 })
    }

    return NextResponse.json(clientCompany)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Rol no autorizado para gestionar empresas cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a esta empresa cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching client company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const PUT = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const body = await request.json()
    const validatedData = updateClientCompanySchema.parse(body)

    const updatedClientCompany = await ClientCompanyService.update(id, validatedData, sessionResult)
    
    if (!updatedClientCompany) {
      return NextResponse.json({ error: "Empresa cliente no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedClientCompany)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === "No tienes permisos para actualizar empresas cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a esta empresa cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error updating client company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: NextRequest, { params }: RouteParams) => {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const deletedClientCompany = await ClientCompanyService.delete(id, sessionResult)
    
    if (!deletedClientCompany) {
      return NextResponse.json({ error: "Empresa cliente no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Empresa cliente desactivada exitosamente",
      id 
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para eliminar empresas cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "No tienes acceso a esta empresa cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("No se puede eliminar una empresa cliente")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error deleting client company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}