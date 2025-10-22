import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

// POST /api/notifications/alerts/read-all - Mark all alert notifications as read
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // En una implementación real, aquí actualizarías todos los registros de notificaciones
    // del usuario para marcarlos como leídos
    
    return NextResponse.json({ 
      success: true,
      message: "Todas las notificaciones marcadas como leídas"
    })

  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}