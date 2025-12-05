"use client"

import { UseFormReturn } from "react-hook-form"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import type { CreateWorkOrderData } from "@/types/work-order.types"
import type { WorkOrderTemplateWithRelations } from "@/types/work-order-template.types"

interface TemplateCustomFieldsProps {
  form: UseFormReturn<CreateWorkOrderData>
  template: WorkOrderTemplateWithRelations | null
}

interface CustomField {
  id: string
  label: string
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "CHECKLIST" | "IMAGE_BEFORE" | "IMAGE_AFTER"
  required?: boolean
  placeholder?: string
  options?: string[]
  defaultValue?: unknown
  multiple?: boolean
  order?: number
}

export function TemplateCustomFields({ form, template }: TemplateCustomFieldsProps) {
  if (!template || !template.customFields) {
    return null
  }

  const customFields = (template.customFields as { fields?: CustomField[] })?.fields || []

  if (customFields.length === 0) {
    return null
  }

  const renderField = (field: CustomField) => {
    // Use the field ID directly as the key in customFieldValues
    const getFieldValue = () => {
      const values = form.getValues('customFieldValues') as Record<string, unknown> || {}
      return values[field.id]
    }

    const setFieldValue = (value: unknown) => {
      const currentValues = form.getValues('customFieldValues') as Record<string, unknown> || {}
      form.setValue('customFieldValues', {
        ...currentValues,
        [field.id]: value
      }, { shouldValidate: true })
    }

    switch (field.type) {
      case "text":
        return (
          <div key={field.id}>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Input
              placeholder={field.placeholder || field.label}
              value={(getFieldValue() as string) || ""}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </div>
        )

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Textarea
              placeholder={field.placeholder || field.label}
              value={(getFieldValue() as string) || ""}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </div>
        )

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Input
              type="number"
              placeholder={field.placeholder || field.label}
              value={(getFieldValue() as number) || ""}
              onChange={(e) => setFieldValue(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        )

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Select
              value={(getFieldValue() as string) || ""}
              onValueChange={setFieldValue}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div key={field.id} className="flex flex-row items-start space-x-3 space-y-0">
            <Checkbox
              checked={(getFieldValue() as boolean) || false}
              onCheckedChange={setFieldValue}
            />
            <div className="space-y-1 leading-none">
              <FormLabel>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            </div>
          </div>
        )

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Input
              type="date"
              value={(getFieldValue() as string) || ""}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </div>
        )

      case "CHECKLIST":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    checked={((getFieldValue() as string[]) || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValue = (getFieldValue() as string[]) || []
                      if (checked) {
                        setFieldValue([...currentValue, option])
                      } else {
                        setFieldValue(currentValue.filter(v => v !== option))
                      }
                    }}
                  />
                  <label className="text-sm">{option}</label>
                </div>
              ))}
            </div>
          </div>
        )

      case "IMAGE_BEFORE":
      case "IMAGE_AFTER":
        return (
          <div key={field.id} className="space-y-2">
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <Input
              type="file"
              accept="image/*"
              multiple={field.multiple}
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setFieldValue(files.map(file => file.name))
              }}
            />
            <div className="text-xs text-muted-foreground">
              {field.multiple ? "Puedes seleccionar múltiples imágenes" : "Selecciona una imagen"}
            </div>
          </div>
        )

      default:
        console.log('Unknown field type:', field.type)
        return null
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {customFields.map(renderField)}
      </CardContent>
    </Card>
  )
}