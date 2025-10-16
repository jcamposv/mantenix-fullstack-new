"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import {
  FormLabel,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Package, Plus, X } from "lucide-react"
import { type WorkOrderTemplateFormData } from "@/schemas/work-order-template"

interface TemplateResourcesProps {
  form: UseFormReturn<WorkOrderTemplateFormData>
}

export function TemplateResources({ form }: TemplateResourcesProps) {
  const [newTool, setNewTool] = useState("")
  const [newMaterial, setNewMaterial] = useState("")

  const tools = form.watch("tools") || []
  const materials = form.watch("materials") || []

  const addTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      form.setValue("tools", [...tools, newTool.trim()])
      setNewTool("")
    }
  }

  const removeTool = (toolToRemove: string) => {
    form.setValue("tools", tools.filter(tool => tool !== toolToRemove))
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      form.setValue("materials", [...materials, newMaterial.trim()])
      setNewMaterial("")
    }
  }

  const removeMaterial = (materialToRemove: string) => {
    form.setValue("materials", materials.filter(material => material !== materialToRemove))
  }

  const handleKeyPress = (
    e: React.KeyboardEvent, 
    value: string, 
    addFunction: () => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFunction()
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Herramientas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <FormLabel>Herramientas Necesarias</FormLabel>
        </div>
        <FormDescription>
          Lista las herramientas que se necesitan para completar el trabajo
        </FormDescription>
        
        {/* Input para agregar herramientas */}
        <div className="flex gap-2">
          <Input
            placeholder="Ej: Destornillador Phillips #2"
            value={newTool}
            onChange={(e) => setNewTool(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, newTool, addTool)}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={addTool}
            disabled={!newTool.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de herramientas */}
        <div className="space-y-2">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span className="text-sm">{tool}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTool(tool)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {tools.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No se han agregado herramientas
            </p>
          )}
        </div>
      </div>

      {/* Materiales */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <FormLabel>Materiales Necesarios</FormLabel>
        </div>
        <FormDescription>
          Lista los materiales y suministros que se requieren
        </FormDescription>
        
        {/* Input para agregar materiales */}
        <div className="flex gap-2">
          <Input
            placeholder="Ej: Aceite 10W-40 (1 litro)"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, newMaterial, addMaterial)}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={addMaterial}
            disabled={!newMaterial.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de materiales */}
        <div className="space-y-2">
          {materials.map((material, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span className="text-sm">{material}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMaterial(material)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No se han agregado materiales
            </p>
          )}
        </div>
      </div>

      {/* Resumen de recursos */}
      {(tools.length > 0 || materials.length > 0) && (
        <div className="md:col-span-2 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Resumen de recursos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    Herramientas ({tools.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tools.map((tool, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {materials.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    Materiales ({materials.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}