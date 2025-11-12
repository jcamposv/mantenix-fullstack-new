import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { Role } from "@prisma/client"

/**
 * Service for password reset operations using Better Auth
 */
export class PasswordResetService {
  /**
   * Validate if admin has permission to reset passwords
   * Only SUPER_ADMIN and ADMIN_EMPRESA can reset passwords
   */
  private static validateResetPermission(role: Role): void {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN_EMPRESA"]

    if (!allowedRoles.includes(role)) {
      throw new Error("No tienes permisos para resetear contraseñas")
    }
  }

  /**
   * Send password reset link to a user using Better Auth
   */
  static async sendResetLink(
    userId: string,
    adminId: string,
    adminRole: Role,
    adminCompanyId: string | null
  ): Promise<{ success: boolean }> {
    // Validate permissions
    this.validateResetPermission(adminRole)

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true
      }
    })

    if (!targetUser) {
      throw new Error("Usuario no encontrado")
    }

    // Company admins can only reset passwords for users in their company
    if (adminRole === "ADMIN_EMPRESA") {
      if (!adminCompanyId) {
        throw new Error("El administrador no tiene empresa asociada")
      }

      if (targetUser.companyId !== adminCompanyId) {
        throw new Error("Solo puedes resetear contraseñas de usuarios de tu empresa")
      }
    }

    // Build redirect URL based on company subdomain
    let redirectTo
    const company = targetUser.company

    if (company?.subdomain) {
      // Use company subdomain
      const domainBase = process.env.DOMAIN_BASE || "mantenix.ai"
      const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://${company.subdomain}.${domainBase}`
        : `http://${company.subdomain}.localhost:3000`
      redirectTo = `${baseUrl}/reset-password`
    } else {
      // Fallback to main domain
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      redirectTo = `${baseUrl}/reset-password`
    }

    // Use Better Auth to send reset password email
    // This will automatically call the sendResetPassword callback configured in auth.ts
    await auth.api.forgetPassword({
      body: {
        email: targetUser.email,
        redirectTo
      }
    })

    return {
      success: true
    }
  }

  /**
   * Reset password using Better Auth
   * This method delegates to Better Auth's native resetPassword method
   * which updates the password hash in the Account table without touching the User
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    // Use Better Auth's native password reset
    // This updates the password in the Account table without deleting/recreating the user
    await auth.api.resetPassword({
      body: {
        token,
        newPassword
      }
    })

    return { success: true }
  }
}
