import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { PermissionHelper } from "../helpers/permission.helper"
import type { AuthenticatedSession } from "@/types/auth.types"

/**
 * Servicio de autenticación
 * Contiene lógica de negocio para autenticación y autorización
 */
export class AuthService {
  static async getAuthenticatedSession(): Promise<AuthenticatedSession | NextResponse> {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user || !session.user.role) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return { user: session.user as AuthenticatedSession['user'] }
  }

  static canUserPerformAction(userRole: string, action: string): boolean {
    return PermissionHelper.hasPermission(userRole, action)
  }
}