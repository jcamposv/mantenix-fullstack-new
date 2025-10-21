"use client"

import { CustomFieldValue } from "./custom-field-value"
import type { CustomField } from "@/schemas/work-order-template"

interface WorkOrderCustomFieldsDisplayProps {
  customFields?: { fields: CustomField[] }
  customFieldValues: Record<string, unknown>
}

export function WorkOrderCustomFieldsDisplay({ 
  customFields, 
  customFieldValues 
}: WorkOrderCustomFieldsDisplayProps) {
  if (!customFields?.fields || Object.keys(customFieldValues).length === 0) {
    return null
  }

  // Create a map of field IDs to field definitions for proper labels
  const fieldMap = new Map(customFields.fields.map(field => [field.id, field]))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(customFieldValues).map(([key, value]) => {
        const field = fieldMap.get(key)
        const label = field?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
        
        return (
          <div key={key}>
            <label className="text-sm font-medium">
              {label}
            </label>
            <div className="mt-1">
              {field ? (
                <CustomFieldValue field={field} value={value} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {typeof value === 'boolean' 
                    ? (value ? 'Sí' : 'No')
                    : value?.toString() || 'N/A'
                  }
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}