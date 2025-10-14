/**
 * Form fields component for invite forms
 * Contains all input fields for account creation
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

interface AcceptInviteFormData {
  name: string
  password: string
  confirmPassword: string
}

interface InviteFormFieldsProps {
  register: UseFormRegister<AcceptInviteFormData>
  errors: FieldErrors<AcceptInviteFormData>
  isSubmitting: boolean
  error?: string | null
  displayCompanyName: string
  companyBranding?: {
    primaryColor?: string
  } | null
}

export function InviteFormFields({
  register,
  errors,
  isSubmitting,
  error,
  displayCompanyName,
  companyBranding,
}: InviteFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Únete a {displayCompanyName}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Completa la configuración de tu cuenta para comenzar
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Name Field */}
      <Field>
        <FieldLabel htmlFor="name">Nombre Completo</FieldLabel>
        <Input
          id="name"
          type="text"
          placeholder="Ingresa tu nombre completo"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </Field>

      {/* Password Field */}
      <Field>
        <FieldLabel htmlFor="password">Crear Contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Crea una contraseña segura"
            {...register("password")}
            aria-invalid={!!errors.password}
            className="pr-10"
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
          Debe tener al menos 8 caracteres
        </FieldDescription>
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </Field>

      {/* Confirm Password Field */}
      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirma tu contraseña"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            className="pr-10"
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
          style={{
            backgroundColor: companyBranding?.primaryColor || undefined,
            borderColor: companyBranding?.primaryColor || undefined,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Cuenta...
            </>
          ) : (
            "Crear Cuenta"
          )}
        </Button>
      </Field>
    </FieldGroup>
  )
}

