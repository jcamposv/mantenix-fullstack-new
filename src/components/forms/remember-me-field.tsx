import { Field } from "@/components/ui/field"
import { useFormContext } from "react-hook-form"

interface RememberMeFieldProps {
  label?: string
  name?: string
}

export function RememberMeField({ 
  label = "Recuérdame",
  name = "remember" 
}: RememberMeFieldProps) {
  const { register } = useFormContext()

  return (
    <Field>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register(name)}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">{label}</span>
      </label>
    </Field>
  )
}