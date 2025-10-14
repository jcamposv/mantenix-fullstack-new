import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"

interface EmailFieldProps {
  label?: string
  placeholder?: string
  required?: boolean
}

export function EmailField({ 
  label = "Correo electrónico", 
  placeholder = "correo@ejemplo.com",
  required = true 
}: EmailFieldProps) {
  const { register, formState: { errors } } = useFormContext()

  return (
    <Field>
      <FieldLabel htmlFor="email">{label}</FieldLabel>
      <Input
        id="email"
        type="email"
        placeholder={placeholder}
        {...register("email", { required })}
        aria-invalid={!!errors.email}
      />
      {errors.email && (
        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
      )}
    </Field>
  )
}