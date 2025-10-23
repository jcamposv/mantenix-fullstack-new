import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthService } from "@/server/services/auth.service"

export const dynamic = 'force-dynamic'

// GET /api/notifications/alerts - Get alert notifications for current user
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación usando AuthService que trae todos los campos necesarios
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Construir filtros basados en el rol del usuario
    const whereClause: Record<string, unknown> = {}

    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todas las alertas
    } else if (session.user.role === "ADMIN_EMPRESA") {
      // Admin empresa puede ver alertas de todas las sedes de su empresa
      if (!session.user.companyId) {
        return NextResponse.json({ error: "Usuario sin empresa asociada" }, { status: 400 })
      }
      
      whereClause.site = {
        clientCompany: {
          tenantCompanyId: session.user.companyId
        }
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      // Admin general del cliente puede ver alertas de todas las sedes de su empresa cliente
      if (!session.user.clientCompanyId) {
        return NextResponse.json({ error: "Usuario sin empresa cliente asociada" }, { status: 400 })
      }
      
      whereClause.site = {
        clientCompanyId: session.user.clientCompanyId
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE" || session.user.role === "CLIENTE_OPERARIO" || session.user.role === "TECNICO") {
      // Usuarios específicos de sede solo pueden ver alertas de su sede
      if (!session.user.siteId) {
        return NextResponse.json({ error: "Usuario sin sede asociada" }, { status: 400 })
      }
      
      whereClause.siteId = session.user.siteId
    } else {
      return NextResponse.json({ error: "Rol no autorizado para ver alertas" }, { status: 403 })
    }

    // Obtener notificaciones de alertas
    const [alerts, totalCount] = await Promise.all([
      prisma.alert.findMany({
        where: {
          ...whereClause,
          // Solo alertas de los últimos 30 días
          reportedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          reportedAt: true,
          site: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          reportedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.alert.count({
        where: {
          ...whereClause,
          reportedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Simular estado de "leído" (en una implementación real, esto vendría de una tabla de notificaciones)
    const notifications = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      priority: alert.priority,
      status: alert.status,
      siteId: alert.site.id,
      siteName: alert.site.name,
      createdAt: alert.reportedAt.toISOString(),
      read: alert.status !== 'OPEN' // Marcar como leído si no está abierto
    }))

    // Contar no leídos
    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching alert notifications:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}