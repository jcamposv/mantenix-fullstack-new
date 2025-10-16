"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Settings } from "lucide-react"
import { 
  type WorkOrderTemplateFormData,
  type CustomField,
  type CustomFieldType,
  createEmptyCustomField,
  getFieldTypeLabel
} from "@/schemas/work-order-template"
import { CustomFieldEditor } from "./custom-field-editor"

interface TemplateCustomFieldsProps {
  form: UseFormReturn<WorkOrderTemplateFormData>
}

const FIELD_TYPES: CustomFieldType[] = [
  "TEXT", "TEXTAREA", "NUMBER", "SELECT", "RADIO", "CHECKBOX", 
  "CHECKLIST", "DATE", "TIME", "DATETIME", "IMAGE_BEFORE", 
  "IMAGE_AFTER", "VIDEO_BEFORE", "VIDEO_AFTER", "FILE"
]

export function TemplateCustomFields({ form }: TemplateCustomFieldsProps) {
  const [selectedFieldType, setSelectedFieldType] = useState<CustomFieldType>("TEXT")
  
  const customFields = form.watch("customFields")
  const fields = customFields?.fields || []

  const addField = () => {
    const newField = createEmptyCustomField(selectedFieldType, fields.length)
    const updatedFields = [...fields, newField]
    
    form.setValue("customFields", {
      fields: updatedFields
    })
  }

  const updateField = (index: number, updatedField: CustomField) => {
    const updatedFields = [...fields]
    updatedFields[index] = updatedField
    
    form.setValue("customFields", {
      fields: updatedFields
    })
  }

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index)
    // Reorder the remaining fields
    const reorderedFields = updatedFields.map((field, i) => ({
      ...field,
      order: i
    }))
    
    form.setValue("customFields", {
      fields: reorderedFields
    })
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const updatedFields = [...fields]
    const [movedField] = updatedFields.splice(fromIndex, 1)
    updatedFields.splice(toIndex, 0, movedField)
    
    // Update order property
    const reorderedFields = updatedFields.map((field, i) => ({
      ...field,
      order: i
    }))
    
    form.setValue("customFields", {
      fields: reorderedFields
    })
  }

  return (
    <div className="space-y-6">
      {/* Header y descripción */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-medium">Campos Personalizados</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Crea campos adicionales que aparecerán en las órdenes de trabajo generadas desde este template.
          Estos campos pueden incluir listas de verificación, imágenes antes/después, campos de texto, etc.
        </p>
      </div>

      {/* Agregar nuevo campo */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Tipo de Campo</label>
          <Select value={selectedFieldType} onValueChange={(value) => setSelectedFieldType(value as CustomFieldType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getFieldTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={addField}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Campo
        </Button>
      </div>

      {/* Lista de campos personalizados */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay campos personalizados configurados</p>
            <p className="text-sm">Agrega campos para personalizar las órdenes de trabajo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <CustomFieldEditor
                key={field.id}
                field={field}
                index={index}
                onUpdate={(updatedField) => updateField(index, updatedField)}
                onRemove={() => removeField(index)}
                onMoveUp={index > 0 ? () => moveField(index, index - 1) : undefined}
                onMoveDown={index < fields.length - 1 ? () => moveField(index, index + 1) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview de los campos */}
      {fields.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Vista previa del formulario:</h4>
          <div className="space-y-3">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id} className="p-3 bg-background rounded border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{field.label}</span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {getFieldTypeLabel(field.type)}
                    </span>
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {field.description}
                    </p>
                  )}
                  {field.options && field.options.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Opciones: {field.options.join(", ")}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}