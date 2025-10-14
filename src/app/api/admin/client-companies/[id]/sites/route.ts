import { NextRequest, NextResponse } from "next/server"
import { AuthService, ClientCompanyService, SiteService } from "@/server"

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id: clientCompanyId } = params
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Verificar que la empresa cliente existe y el usuario tiene acceso
    const clientCompany = await ClientCompanyService.getById(clientCompanyId, sessionResult)
    if (!clientCompany) {
      return NextResponse.json({ 
        error: "Empresa cliente no encontrada o acceso denegado" 
      }, { status: 404 })
    }

    // Obtener sedes de esta empresa cliente
    const sites = await SiteService.getAll(sessionResult)
    
    // Filtrar solo las sedes de esta empresa cliente
    const filteredSites = sites.filter(site => site.clientCompanyId === clientCompanyId)

    return NextResponse.json(filteredSites)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No tienes permisos para ver sedes") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Rol no autorizado para gestionar empresas cliente") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("Usuario sin")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error("Error fetching sites for client company:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}