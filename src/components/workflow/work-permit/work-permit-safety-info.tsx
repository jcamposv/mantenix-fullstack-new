"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormLabel, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { WorkPermitFormData } from "@/schemas/work-permit.schema"

interface WorkPermitSafetyInfoProps {
  form: UseFormReturn<WorkPermitFormData>
  hazards: string[]
  setHazards: (value: string[]) => void
  precautions: string[]
  setPrecautions: (value: string[]) => void
  ppe: string[]
  setPPE: (value: string[]) => void
}

export function WorkPermitSafetyInfo({
  form,
  hazards,
  setHazards,
  precautions,
  setPrecautions,
  ppe,
  setPPE
}: WorkPermitSafetyInfoProps) {
  const [newHazard, setNewHazard] = useState("")
  const [newPrecaution, setNewPrecaution] = useState("")
  const [newPPE, setNewPPE] = useState("")

  const addItem = (value: string, setter: (value: string[]) => void, currentArray: string[], clearInput: () => void) => {
    if (value.trim()) {
      setter([...currentArray, value.trim()])
      clearInput()
    }
  }

  const removeItem = (index: number, setter: (value: string[]) => void, currentArray: string[]) => {
    setter(currentArray.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Hazards */}
      <FormField
        control={form.control}
        name="hazards"
        render={() => (
          <FormItem>
            <FormLabel>Peligros Identificados *</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Escriba un peligro y presione Enter"
                value={newHazard}
                onChange={(e) => setNewHazard(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addItem(newHazard, setHazards, hazards, () => setNewHazard(""))
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addItem(newHazard, setHazards, hazards, () => setNewHazard(""))}
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {hazards.map((hazard, index) => (
                <Badge key={index} variant="secondary">
                  {hazard}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeItem(index, setHazards, hazards)}
                  />
                </Badge>
              ))}
            </div>
            <FormDescription>
              Ej: Chispas, Espacios confinados, Alturas, Químicos
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Precautions */}
      <FormField
        control={form.control}
        name="precautions"
        render={() => (
          <FormItem>
            <FormLabel>Precauciones Requeridas *</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Escriba una precaución y presione Enter"
                value={newPrecaution}
                onChange={(e) => setNewPrecaution(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addItem(newPrecaution, setPrecautions, precautions, () => setNewPrecaution(""))
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addItem(newPrecaution, setPrecautions, precautions, () => setNewPrecaution(""))}
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {precautions.map((precaution, index) => (
                <Badge key={index} variant="secondary">
                  {precaution}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeItem(index, setPrecautions, precautions)}
                  />
                </Badge>
              ))}
            </div>
            <FormDescription>
              Ej: Ventilación adecuada, Señalización, Extintor cercano
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* PPE */}
      <FormField
        control={form.control}
        name="ppe"
        render={() => (
          <FormItem>
            <FormLabel>EPP Requerido *</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Escriba un EPP y presione Enter"
                value={newPPE}
                onChange={(e) => setNewPPE(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addItem(newPPE, setPPE, ppe, () => setNewPPE(""))
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addItem(newPPE, setPPE, ppe, () => setNewPPE(""))}
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {ppe.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeItem(index, setPPE, ppe)}
                  />
                </Badge>
              ))}
            </div>
            <FormDescription>
              Ej: Casco, Guantes aislantes, Careta de soldadura, Arnés
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
