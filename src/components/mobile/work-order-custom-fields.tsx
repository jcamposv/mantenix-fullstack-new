"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Camera, Video, Upload, Check } from "lucide-react"
import { MediaField } from "@/components/forms/mobile/media-field"
import type { CustomField } from "@/schemas/work-order-template"

interface WorkOrderCustomFieldsProps {
  customFields?: { fields: CustomField[] }
  readOnly?: boolean
}

export function WorkOrderCustomFields({ 
  customFields, 
  readOnly = false
}: WorkOrderCustomFieldsProps) {
  const form = useFormContext()
  const [mediaFiles, setMediaFiles] = useState<Record<string, File[]>>({})

  if (!customFields?.fields || customFields.fields.length === 0) {
    return null
  }

  const handleValueChange = (fieldId: string, value: unknown) => {
    console.log(`Custom field changed: ${fieldId} = `, value)
    form.setValue(`customFieldValues.${fieldId}`, value)
  }

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    setMediaFiles(prev => ({ ...prev, [fieldId]: fileArray }))
    form.setValue(`customFieldValues.${fieldId}`, fileArray)
  }

  const handleChecklistChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = form.getValues(`customFieldValues.${fieldId}`) || []
    const newValues = checked 
      ? [...currentValues, option]
      : currentValues.filter((v: string) => v !== option)
    handleValueChange(fieldId, newValues)
  }

  const renderField = (field: CustomField) => {
    const value = form.watch(`customFieldValues.${field.id}`) || field.defaultValue

    switch (field.type) {
      case "TEXT":
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            readOnly={readOnly}
          />
        )

      case "TEXTAREA":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            readOnly={readOnly}
            rows={3}
          />
        )

      case "NUMBER":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, Number(e.target.value))}
            readOnly={readOnly}
          />
        )

      case "SELECT":
        return (
          <Select 
            value={value || ""} 
            onValueChange={(val) => handleValueChange(field.id, val)}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "RADIO":
        return (
          <RadioGroup 
            value={value || ""} 
            onValueChange={(val) => handleValueChange(field.id, val)}
            disabled={readOnly}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "CHECKBOX":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => handleValueChange(field.id, checked)}
              disabled={readOnly}
            />
            <Label>{field.options?.[0] || "Sí"}</Label>
          </div>
        )

      case "CHECKLIST":
        const checkedItems = value || []
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={checkedItems.includes(option)}
                  onCheckedChange={(checked) => 
                    handleChecklistChange(field.id, option, !!checked)
                  }
                  disabled={readOnly}
                />
                <Label className="flex-1">{option}</Label>
                {checkedItems.includes(option) && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        )

      case "DATE":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            readOnly={readOnly}
          />
        )

      case "TIME":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            readOnly={readOnly}
          />
        )

      case "DATETIME":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            readOnly={readOnly}
          />
        )

      case "IMAGE_BEFORE":
      case "IMAGE_AFTER":
      case "VIDEO_BEFORE":
      case "VIDEO_AFTER":
        return <MediaField field={field} readOnly={readOnly} />

      case "FILE":
        return (
          <div className="space-y-2">
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = field.multiple ?? false
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement
                    handleFileChange(field.id, target.files)
                  }
                  input.click()
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Archivo
              </Button>
            )}
            {mediaFiles[field.id] && (
              <div className="space-y-1">
                {mediaFiles[field.id].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return <div>Tipo de campo no soportado: {field.type}</div>
    }
  }

  // Sort fields by order
  const sortedFields = [...customFields.fields].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Formulario de Trabajo</h3>
      {sortedFields.map((field) => {
        const fieldError = (form.formState.errors.customFieldValues as Record<string, unknown>)?.[field.id]
        const hasError = !!fieldError
        return (
          <div key={field.id} className="space-y-2">
            <Label className={`text-sm font-medium ${hasError ? 'text-destructive' : ''}`}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <div className={hasError ? 'border border-destructive rounded p-2' : ''}>
              {renderField(field)}
            </div>
            {hasError && (
              <p className="text-xs text-destructive">{(fieldError as { message?: string })?.message}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}