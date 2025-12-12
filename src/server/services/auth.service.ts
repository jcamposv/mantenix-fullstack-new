import { NextResponse } from "next/server"
import { PermissionHelper } from "../helpers/permission.helper"
import type { AuthenticatedSession } from "@/types/auth.types"
import { getCurrentUserWithRole } from "@/lib/auth-utils"

/**
 * Servicio de autenticación
 * Contiene lógica de negocio para autenticación y autorización
 */
export class AuthService {
  static async getAuthenticatedSession(): Promise<AuthenticatedSession | NextResponse> {
    // Use getCurrentUserWithRole to get full user data including clientCompanyId and siteId
    const user = await getCurrentUserWithRole()

    if (!user || !user.role) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return { user: user as AuthenticatedSession['user'] }
  }

  /**
   * @deprecated Use canUserPerformActionAsync instead
   */
  static canUserPerformAction(userRole: string, action: string): boolean {
    return PermissionHelper.hasPermission(userRole, action)
  }

  /**
   * Check if user can perform action (supports custom roles)
   */
  static async canUserPerformActionAsync(session: AuthenticatedSession, action: string): Promise<boolean> {
    return PermissionHelper.hasPermissionAsync(session, action)
  }
}