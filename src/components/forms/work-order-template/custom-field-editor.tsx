"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronUp, 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Plus,
  X,
  Settings
} from "lucide-react"
import { 
  type CustomField,
  getFieldTypeLabel 
} from "@/schemas/work-order-template"

interface CustomFieldEditorProps {
  field: CustomField
  index: number
  onUpdate: (field: CustomField) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function CustomFieldEditor({
  field,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}: CustomFieldEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newOption, setNewOption] = useState("")

  const supportsOptions = ["SELECT", "RADIO", "CHECKLIST"].includes(field.type)
  const supportsValidation = ["TEXT", "TEXTAREA", "NUMBER"].includes(field.type)
  const supportsMultiple = ["IMAGE_BEFORE", "IMAGE_AFTER", "VIDEO_BEFORE", "VIDEO_AFTER", "FILE"].includes(field.type)

  const updateField = (updates: Partial<CustomField>) => {
    onUpdate({ ...field, ...updates })
  }

  const addOption = () => {
    if (newOption.trim() && field.options) {
      const updatedOptions = [...field.options, newOption.trim()]
      updateField({ options: updatedOptions })
      setNewOption("")
    }
  }

  const removeOption = (optionIndex: number) => {
    if (field.options) {
      const updatedOptions = field.options.filter((_, i) => i !== optionIndex)
      updateField({ options: updatedOptions })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOption()
    }
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-base">
                    {field.label || `Campo ${index + 1}`}
                  </span>
                  {field.required && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {getFieldTypeLabel(field.type)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Botones de mover */}
                <div className="flex gap-1">
                  {onMoveUp && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveUp()
                      }}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                  )}
                  {onMoveDown && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveDown()
                      }}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Botón eliminar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                
                {/* Chevron */}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Configuración básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Etiqueta *</label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField({ label: e.target.value })}
                  placeholder="Nombre del campo"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Placeholder</label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  placeholder="Texto de ayuda"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={field.description || ""}
                onChange={(e) => updateField({ description: e.target.value })}
                placeholder="Descripción detallada del campo"
                className="min-h-[60px]"
              />
            </div>

            {/* Opciones de configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo requerido */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => updateField({ required: !!checked })}
                />
                <label htmlFor={`required-${field.id}`} className="text-sm font-medium">
                  Campo requerido
                </label>
              </div>

              {/* Múltiples valores (para archivos/imágenes) */}
              {supportsMultiple && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`multiple-${field.id}`}
                    checked={field.multiple || false}
                    onCheckedChange={(checked) => updateField({ multiple: !!checked })}
                  />
                  <label htmlFor={`multiple-${field.id}`} className="text-sm font-medium">
                    Múltiples archivos
                  </label>
                </div>
              )}
            </div>

            {/* Opciones para SELECT, RADIO, CHECKLIST */}
            {supportsOptions && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Opciones *</label>
                
                {/* Agregar nueva opción */}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nueva opción"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addOption}
                    disabled={!newOption.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de opciones */}
                <div className="space-y-2">
                  {field.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(optionIndex)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(!field.options || field.options.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No hay opciones configuradas
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Validación para TEXT, TEXTAREA, NUMBER */}
            {supportsValidation && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Validación</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {field.type === "NUMBER" ? "Valor mínimo" : "Longitud mínima"}
                    </label>
                    <Input
                      type="number"
                      value={field.validation?.min || ""}
                      onChange={(e) => updateField({
                        validation: {
                          ...field.validation,
                          min: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {field.type === "NUMBER" ? "Valor máximo" : "Longitud máxima"}
                    </label>
                    <Input
                      type="number"
                      value={field.validation?.max || ""}
                      onChange={(e) => updateField({
                        validation: {
                          ...field.validation,
                          max: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}