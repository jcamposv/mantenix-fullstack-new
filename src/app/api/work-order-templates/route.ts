import { NextRequest, NextResponse } from "next/server"
import { WorkOrderTemplateService } from "@/server/services/work-order-template.service"
import { AuthService } from "@/server/services/auth.service"
import { 
  createWorkOrderTemplateSchema, 
  workOrderTemplateFiltersSchema 
} from "@/app/api/schemas/work-order-template-schemas"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = workOrderTemplateFiltersSchema.parse(Object.fromEntries(searchParams))

    // Get templates
    const result = await WorkOrderTemplateService.getList(session, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching work order templates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Parse request body
    const body = await request.json()
    const templateData = createWorkOrderTemplateSchema.parse(body)

    // Create template
    const template = await WorkOrderTemplateService.create(templateData, session)

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating work order template:", error)
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