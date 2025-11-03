import { Control } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { AIConfigFormData } from "@/schemas/ai-config"

interface AIConfigFeaturesProps {
  control: Control<AIConfigFormData>
}

export function AIConfigFeatures({ control }: AIConfigFeaturesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Funcionalidades de IA</h3>
        <p className="text-sm text-muted-foreground">
          Activa o desactiva funcionalidades específicas de IA
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="insightsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Dashboard Insights</FormLabel>
                <FormDescription>
                  Análisis inteligente del dashboard con recomendaciones
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="reportsEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">AI Reports</FormLabel>
                <FormDescription>
                  Generación de reportes inteligentes con IA
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="predictiveEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Predictive Analysis</FormLabel>
                <FormDescription>
                  Análisis predictivo y detección de anomalías (beta)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
