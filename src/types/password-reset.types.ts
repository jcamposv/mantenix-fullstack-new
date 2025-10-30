import type { PasswordResetToken, User } from "@prisma/client"

/**
 * Password Reset Token types
 */
export interface PasswordResetTokenWithRelations extends PasswordResetToken {
  user?: Pick<User, "id" | "name" | "email" | "role"> | null
  creator?: Pick<User, "id" | "name" | "email" | "role"> | null
}

export interface CreatePasswordResetData {
  userId: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
  expiresAt?: Date
}
