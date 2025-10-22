import { z } from "zod"
import type { CustomField } from "./work-order-template"

// Base schema for completing work orders in mobile
export const baseMobileCompleteWorkOrderSchema = z.object({
  completionNotes: z.string().optional(),
  observations: z.string().optional(),
  actualDuration: z.number().min(0, "La duración real debe ser mayor o igual a 0").optional(),
  actualCost: z.number().min(0, "El costo real debe ser mayor o igual a 0").optional(),
  customFieldValues: z.record(z.string(), z.unknown()).optional()
})

// Function to create dynamic schema based on custom fields
export const createMobileCompleteWorkOrderSchema = (customFields?: { fields: CustomField[] }) => {
  if (!customFields?.fields || customFields.fields.length === 0) {
    return baseMobileCompleteWorkOrderSchema
  }

  const customFieldsSchema: Record<string, z.ZodTypeAny> = {}
  
  for (const field of customFields.fields) {
    if (field.required) {
      switch (field.type) {
        case 'CHECKLIST':
          customFieldsSchema[field.id] = z.array(z.string()).min(1, `${field.label} es requerido`)
          break
        case 'TEXT':
        case 'TEXTAREA':
          customFieldsSchema[field.id] = z.string().min(1, `${field.label} es requerido`)
          break
        case 'NUMBER':
          customFieldsSchema[field.id] = z.number({ message: `${field.label} es requerido` })
          break
        case 'SELECT':
        case 'RADIO':
          customFieldsSchema[field.id] = z.string().min(1, `${field.label} es requerido`)
          break
        case 'DATE':
        case 'TIME':
        case 'DATETIME':
          customFieldsSchema[field.id] = z.string().min(1, `${field.label} es requerido`)
          break
        case 'CHECKBOX':
          customFieldsSchema[field.id] = z.boolean().refine(val => val === true, `${field.label} es requerido`)
          break
        case 'IMAGE_BEFORE':
        case 'IMAGE_AFTER':
        case 'VIDEO_BEFORE':
        case 'VIDEO_AFTER':
        case 'FILE':
          customFieldsSchema[field.id] = z.any().refine(
            val => val !== undefined && val !== null && 
                  (Array.isArray(val) ? val.length > 0 : val !== ''), 
            `${field.label} es requerido`
          )
          break
        default:
          customFieldsSchema[field.id] = z.any().refine(
            val => val !== undefined && val !== null && val !== '', 
            `${field.label} es requerido`
          )
      }
    } else {
      customFieldsSchema[field.id] = z.any().optional()
    }
  }

  return baseMobileCompleteWorkOrderSchema.extend({
    customFieldValues: z.object(customFieldsSchema)
  })
}

// Schema for starting work
export const startWorkOrderSchema = z.object({
  status: z.literal('IN_PROGRESS'),
  startedAt: z.string()
})

// Schema for canceling work  
export const cancelWorkOrderSchema = z.object({
  notes: z.string().optional()
})

// Type exports
export type MobileCompleteWorkOrderData = z.infer<typeof baseMobileCompleteWorkOrderSchema>
export type StartWorkOrderData = z.infer<typeof startWorkOrderSchema>
export type CancelWorkOrderData = z.infer<typeof cancelWorkOrderSchema>