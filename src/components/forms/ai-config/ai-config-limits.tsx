import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AIConfigFormData } from "@/schemas/ai-config"

interface AIConfigLimitsProps {
  control: Control<AIConfigFormData>
}

export function AIConfigLimits({ control }: AIConfigLimitsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Límites y Alertas</h3>
        <p className="text-sm text-muted-foreground">
          Configura los límites de uso mensual de IA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="monthlyTokenLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Límite Mensual de Tokens *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  min={1000}
                  step={1000}
                />
              </FormControl>
              <FormDescription>
                Mínimo: 1,000 tokens • Recomendado: 100,000 - 500,000
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="alertThresholdPercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Umbral de Alerta (%) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="80"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                  min={50}
                  max={99}
                />
              </FormControl>
              <FormDescription>
                Alerta cuando el uso supere este porcentaje (50-99%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
