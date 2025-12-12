"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { aiConfigSchema, AIConfigFormData, AIConfigSubmitData } from "@/schemas/ai-config"
import { AIConfigLimits } from "./ai-config-limits"
import { AIConfigFeatures } from "./ai-config-features"

interface AIConfigFormProps {
  onSubmit: (data: AIConfigSubmitData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<AIConfigFormData>
}

export function AIConfigForm({
  onSubmit,
  onCancel,
  loading,
  initialData
}: AIConfigFormProps) {
  const form = useForm<AIConfigFormData>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      monthlyTokenLimit: initialData?.monthlyTokenLimit || 100000,
      alertThresholdPercent: initialData?.alertThresholdPercent || 80,
      insightsEnabled: initialData?.insightsEnabled ?? true,
      reportsEnabled: initialData?.reportsEnabled ?? true,
      predictiveEnabled: initialData?.predictiveEnabled ?? false,
    },
  })

  const handleSubmit = (data: AIConfigFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Token Limits */}
        <AIConfigLimits control={form.control} />

        {/* AI Features */}
        <AIConfigFeatures control={form.control} />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
