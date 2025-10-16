"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, FileText, Clock, DollarSign, Shield, Plus } from "lucide-react"
import type { WorkOrderTemplateWithRelations, CustomField } from "@/types/work-order-template.types"

interface TemplatePreviewModalProps {
  template: WorkOrderTemplateWithRelations | null
  open: boolean
  onClose: () => void
  onSelect: (templateId: string) => void
}

export function TemplatePreviewModal({
  template,
  open,
  onClose,
  onSelect
}: TemplatePreviewModalProps) {
  if (!template) return null

  const customFields = (template.customFields as { fields?: CustomField[] } | null)?.fields || []

  const getFieldTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "TEXT":
      case "TEXTAREA":
        return <FileText className="h-3 w-3" />
      case "NUMBER":
        return <DollarSign className="h-3 w-3" />
      case "SELECT":
      case "RADIO":
        return <Settings className="h-3 w-3" />
      case "CHECKBOX":
      case "CHECKLIST":
        return <Shield className="h-3 w-3" />
      case "DATE":
      case "TIME":
      case "DATETIME":
        return <Clock className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const getFieldTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case "TEXT":
        return "Texto"
      case "TEXTAREA":
        return "Texto largo"
      case "NUMBER":
        return "Número"
      case "SELECT":
        return "Selección"
      case "RADIO":
        return "Opción Única"
      case "CHECKBOX":
        return "Casilla"
      case "CHECKLIST":
        return "Lista"
      case "DATE":
        return "Fecha"
      case "TIME":
        return "Hora"
      case "DATETIME":
        return "Fecha y Hora"
      case "IMAGE_BEFORE":
      case "IMAGE_AFTER":
      case "VIDEO_BEFORE":
      case "VIDEO_AFTER":
      case "FILE":
        return "Archivo"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Vista Previa: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre:</label>
                <p className="text-sm text-muted-foreground">{template.name}</p>
              </div>
              
              {template.category && (
                <div>
                  <label className="text-sm font-medium">Categoría:</label>
                  <Badge variant="outline" className="ml-2">{template.category}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Campos Personalizados ({customFields.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFieldTypeIcon(field.type)}
                          <span className="font-medium">{field.label}</span>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Requerido
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getFieldTypeLabel(field.type)}
                        </Badge>
                      </div>
                      
                      {field.placeholder && (
                        <p className="text-xs text-muted-foreground">
                          Placeholder: {field.placeholder}
                        </p>
                      )}
                      
                      {field.options && field.options.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Opciones: </span>
                          {field.options.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => onSelect(template.id)}>
              <Plus className="mr-2 h-4 w-4" />
              Usar este Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}