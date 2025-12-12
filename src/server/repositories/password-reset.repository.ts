import { prisma } from "@/lib/prisma"
import type { PasswordResetToken } from "@prisma/client"

/**
 * Repository for PasswordResetToken data access
 */
export class PasswordResetRepository {
  /**
   * Find active reset token by token string
   */
  static async findActiveByToken(token: string): Promise<PasswordResetToken | null> {
    return await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })
  }

  /**
   * Find active reset token for a user
   */
  static async findActiveByUserId(userId: string): Promise<PasswordResetToken | null> {
    return await prisma.passwordResetToken.findFirst({
      where: {
        userId,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })
  }

  /**
   * Create a new password reset token
   */
  static async create(
    token: string,
    userId: string,
    createdBy: string,
    expiresAt: Date
  ): Promise<PasswordResetToken> {
    return await prisma.passwordResetToken.create({
      data: {
        token,
        userId,
        createdBy,
        expiresAt
      }
    })
  }

  /**
   * Mark a token as used
   */
  static async markAsUsed(id: string): Promise<PasswordResetToken> {
    return await prisma.passwordResetToken.update({
      where: { id },
      data: {
        used: true,
        usedAt: new Date()
      }
    })
  }

  /**
   * Invalidate all active tokens for a user
   */
  static async invalidateUserTokens(userId: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: {
        used: true,
        usedAt: new Date()
      }
    })
  }
}
