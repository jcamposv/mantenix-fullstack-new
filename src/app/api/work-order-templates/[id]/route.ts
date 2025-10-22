import { NextRequest, NextResponse } from "next/server"
import { WorkOrderTemplateService } from "@/server/services/work-order-template.service"
import { AuthService } from "@/server/services/auth.service"
import { updateWorkOrderTemplateSchema } from "@/app/api/schemas/work-order-template-schemas"

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get template ID
    const { id } = await params

    // Get template by ID
    const template = await WorkOrderTemplateService.getById(id, session)

    if (!template) {
      return NextResponse.json(
        { error: "Template no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching work order template:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get template ID
    const { id } = await params

    // Parse request body
    const body = await request.json()
    const templateData = updateWorkOrderTemplateSchema.parse(body)

    // Update template
    const template = await WorkOrderTemplateService.update(id, templateData, session)

    if (!template) {
      return NextResponse.json(
        { error: "Template no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating work order template:", error)
    if (error instanceof Error) {
      // Check for validation errors
      if (error.message.includes("Ya existe un template")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Get template ID
    const { id } = await params

    // Delete template
    const template = await WorkOrderTemplateService.delete(id, session)

    if (!template) {
      return NextResponse.json(
        { error: "Template no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Template eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting work order template:", error)
    if (error instanceof Error && error.message.includes("No tienes permisos")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}