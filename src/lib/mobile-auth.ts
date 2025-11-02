import { redirect } from "next/navigation"
import { getCurrentUserWithRole } from "@/lib/auth-utils"
import type { Role } from "@prisma/client"

/**
 * Verifica que el usuario tenga uno de los roles permitidos para acceder a una página móvil
 * Si no tiene permiso, redirige a /mobile (página principal móvil)
 */
export async function requireMobileRole(allowedRoles: Role[]) {
  const user = await getCurrentUserWithRole()

  if (!user || !user.role) {
    redirect('/auth/signin')
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirigir a la página principal móvil si no tiene permiso
    redirect('/mobile')
  }

  return user
}

/**
 * Roles que pueden ver Work Orders
 */
export const WORK_ORDERS_ROLES: Role[] = [
  'TECNICO',
  'SUPERVISOR',
  'ADMIN_EMPRESA',
  'SUPER_ADMIN'
]

/**
 * Roles que pueden ver Attendance
 */
export const ATTENDANCE_ROLES: Role[] = [
  'TECNICO',
  'SUPERVISOR',
  'ADMIN_EMPRESA',
  'SUPER_ADMIN'
]

/**
 * Roles que pueden crear alertas
 */
export const CREATE_ALERT_ROLES: Role[] = [
  'CLIENTE_ADMIN_GENERAL',
  'CLIENTE_ADMIN_SEDE',
  'CLIENTE_OPERARIO',
  'SUPER_ADMIN'
]

/**
 * Roles que pueden ver alertas
 */
export const VIEW_ALERTS_ROLES: Role[] = [
  'CLIENTE_ADMIN_GENERAL',
  'CLIENTE_ADMIN_SEDE',
  'CLIENTE_OPERARIO',
  'ADMIN_EMPRESA',
  'SUPER_ADMIN'
]
