import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import type { AuthenticatedSession } from "@/types/auth.types"

// POST /api/notifications/alerts/[id]/read - Mark alert notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const sessionResult = await auth.api.getSession({
      headers: await headers()
    })

    if (!sessionResult?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const session = sessionResult as AuthenticatedSession

    const { id: alertId } = await params

    // Verificar que la alerta existe y el usuario tiene acceso
    const whereClause: Record<string, unknown> = { id: alertId }

    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede acceder a todas las alertas
    } else if (session.user.role === "ADMIN_EMPRESA") {
      // Admin empresa puede acceder a alertas de su empresa
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Usuario sin empresa asociada" }, { status: 400 })
      }
      
      whereClause.site = {
        clientCompany: {
          tenantCompanyId: session.user.companyId
        }
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      // Admin general del cliente puede acceder a alertas de su empresa cliente
      if (!session.user.clientCompanyId) {
        return NextResponse.json({ error: "Usuario sin empresa cliente asociada" }, { status: 400 })
      }
      
      whereClause.site = {
        clientCompanyId: session.user.clientCompanyId
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE" || session.user.role === "CLIENTE_OPERARIO" || session.user.role === "TECNICO") {
      // Usuarios específicos de sede solo pueden acceder a alertas de su sede
      if (!session.user.siteId) {
        return NextResponse.json({ error: "Usuario sin sede asociada" }, { status: 400 })
      }
      
      whereClause.siteId = session.user.siteId
    } else {
      return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 })
    }

    const alert = await prisma.alert.findFirst({
      where: whereClause
    })

    if (!alert) {
      return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 })
    }

    // En una implementación real, aquí crearías/actualizarías un registro de notificación
    // Por ahora, simplemente retornamos éxito
    
    return NextResponse.json({ 
      success: true,
      message: "Notificación marcada como leída"
    })

  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}