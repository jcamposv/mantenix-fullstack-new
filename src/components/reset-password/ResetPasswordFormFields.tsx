/**
 * Form fields component for password reset
 */

import { useState } from "react"
import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import type { ResetPasswordSchema } from "@/schemas/password-reset"

interface ResetPasswordFormFieldsProps {
  register: UseFormRegister<ResetPasswordSchema>
  errors: FieldErrors<ResetPasswordSchema>
  isSubmitting: boolean
  error?: string | null
  userEmail?: string
}

export function ResetPasswordFormFields({
  register,
  errors,
  isSubmitting,
  error,
  userEmail,
}: ResetPasswordFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Resetear Contraseña</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {userEmail ? `Ingresa tu nueva contraseña para ${userEmail}` : "Ingresa tu nueva contraseña"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Email Field (Disabled - just for display) - Only show if email is available */}
      {userEmail && (
        <Field>
          <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-gray-100"
          />
        </Field>
      )}

      {/* New Password Field */}
      <Field>
        <FieldLabel htmlFor="newPassword">Nueva Contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu nueva contraseña"
            {...register("newPassword")}
            aria-invalid={!!errors.newPassword}
            className="pr-10"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldDescription>
          Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
        </FieldDescription>
        {errors.newPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
        )}
      </Field>

      {/* Confirm Password Field */}
      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirma tu nueva contraseña"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            className="pr-10"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </Field>

      {/* Submit Button */}
      <Field>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando Contraseña...
            </>
          ) : (
            "Actualizar Contraseña"
          )}
        </Button>
      </Field>
    </FieldGroup>
  )
}
