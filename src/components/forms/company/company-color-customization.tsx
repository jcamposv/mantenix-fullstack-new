import { Control } from "react-hook-form"
import { CompanyFormData } from "@/schemas/company"
import { ColorPickerField } from "../color-picker-field"

interface CompanyColorCustomizationProps {
  control: Control<CompanyFormData>
}

const COMPANY_COLOR_FIELDS = [
  {
    name: "primaryColor" as const,
    label: "Color Primario",
    placeholder: "#3b82f6",
  },
  {
    name: "secondaryColor" as const,
    label: "Color Secundario", 
    placeholder: "#64748b",
  },
  {
    name: "backgroundColor" as const,
    label: "Color de Fondo",
    placeholder: "#ffffff",
  },
]

export function CompanyColorCustomization({ control }: CompanyColorCustomizationProps) {
  return (
    <ColorPickerField
      control={control}
      fields={COMPANY_COLOR_FIELDS}
      title="Personalización de Colores"
      columns={3}
    />
  )
}