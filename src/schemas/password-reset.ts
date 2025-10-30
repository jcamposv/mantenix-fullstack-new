import { z } from "zod"

/**
 * Schema for resetting password with token (for form)
 */
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

/**
 * Schema for API request (includes token)
 */
export const resetPasswordApiSchema = z.object({
  token: z.string().min(1, "Token es requerido"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    )
})

export type ResetPasswordApiSchema = z.infer<typeof resetPasswordApiSchema>

/**
 * Schema for verifying reset token
 */
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Token es requerido")
})

export type VerifyResetTokenSchema = z.infer<typeof verifyResetTokenSchema>
