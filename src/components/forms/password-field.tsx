import { useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useFormContext } from "react-hook-form"

interface PasswordFieldProps {
  label?: string
  name?: string
  showForgotPassword?: boolean
  forgotPasswordUrl?: string
  required?: boolean
}

export function PasswordField({ 
  label = "Contraseña",
  name = "password",
  showForgotPassword = false,
  forgotPasswordUrl = "/forgot-password",
  required = true
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { register, formState: { errors } } = useFormContext()

  return (
    <Field>
      <div className="flex items-center">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {showForgotPassword && (
          <a
            href={forgotPasswordUrl}
            className="ml-auto text-sm underline-offset-2 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          id={name}
          type={showPassword ? "text" : "password"}
          {...register(name, { required })}
          aria-invalid={!!errors[name]}
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
      {errors[name] && (
        <p className="text-sm text-red-600 mt-1">{errors[name]?.message}</p>
      )}
    </Field>
  )
}