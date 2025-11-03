"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
    <>
      {Object.entries(customFieldValues).map(([key, value]) => {
        const field = fieldMap.get(key)
        const label = field?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

        return (
          <Card key={key} className="shadow-none">
            <CardHeader className="pb-3 border-b">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </h3>
            </CardHeader>
            <CardContent className="pt-4">
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
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}