"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
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
    const fieldName = `customFieldValues.${field.id}` as const

    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder || field.label}
                    {...formField}
                    value={formField.value as string || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "textarea":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder || field.label}
                    {...formField}
                    value={formField.value as string || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "number":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.placeholder || field.label}
                    {...formField}
                    value={formField.value as number || ""}
                    onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "select":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select
                  value={formField.value as string || ""}
                  onValueChange={formField.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "checkbox":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={formField.value as boolean || false}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "date":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...formField}
                    value={formField.value as string || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "CHECKLIST":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={(formField.value as string[] || []).includes(option)}
                        onCheckedChange={(checked) => {
                          const currentValue = (formField.value as string[]) || []
                          if (checked) {
                            formField.onChange([...currentValue, option])
                          } else {
                            formField.onChange(currentValue.filter(v => v !== option))
                          }
                        }}
                      />
                      <label className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "IMAGE_BEFORE":
      case "IMAGE_AFTER":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple={field.multiple}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      formField.onChange(files.map(file => file.name)) // Store file names for now
                    }}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  {field.multiple ? "Puedes seleccionar múltiples imágenes" : "Selecciona una imagen"}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        console.log('Unknown field type:', field.type)
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Campos del Template: {template.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customFields.map(renderField)}
      </CardContent>
    </Card>
  )
}