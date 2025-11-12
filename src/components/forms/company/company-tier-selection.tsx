import { Control } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CompanyFormData } from "@/schemas/company"

interface CompanyTierSelectionProps {
  control: Control<CompanyFormData>
}

const TIER_OPTIONS = [
  { value: "STARTER", label: "Starter", description: "Plan básico para comenzar" },
  { value: "PROFESSIONAL", label: "Professional", description: "Para empresas en crecimiento" },
  { value: "ENTERPRISE", label: "Enterprise", description: "Para grandes organizaciones" },
]

export function CompanyTierSelection({ control }: CompanyTierSelectionProps) {
  return (
    <FormField
      control={control}
      name="tier"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Plan de Suscripción *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un plan" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {TIER_OPTIONS.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  <div>
                    <div className="font-medium">{tier.label}</div>
                    <div className="text-sm text-muted-foreground">{tier.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}