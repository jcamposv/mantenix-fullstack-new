import * as z from "zod"

export const aiConfigSchema = z.object({
  monthlyTokenLimit: z
    .number()
    .min(1000, "El límite mensual debe ser al menos 1,000 tokens")
    .max(10000000, "El límite mensual no puede exceder 10,000,000 tokens"),
  alertThresholdPercent: z
    .number()
    .min(50, "El umbral de alerta debe ser al menos 50%")
    .max(99, "El umbral de alerta no puede exceder 99%"),
  insightsEnabled: z.boolean(),
  reportsEnabled: z.boolean(),
  predictiveEnabled: z.boolean(),
})

export type AIConfigFormData = z.infer<typeof aiConfigSchema>

export interface AIConfigSubmitData extends AIConfigFormData {
  resetTokens?: boolean
}
