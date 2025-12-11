"use client"

import { useState } from "react"
import { FormLabel, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface WorkPermitSafetyInfoProps {
  hazards: string[]
  setHazards: React.Dispatch<React.SetStateAction<string[]>>
  precautions: string[]
  setPrecautions: React.Dispatch<React.SetStateAction<string[]>>
  ppe: string[]
  setPPE: React.Dispatch<React.SetStateAction<string[]>>
}

export function WorkPermitSafetyInfo({
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

  const addItem = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, clearInput: () => void) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()])
      clearInput()
    }
  }

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Hazards */}
      <div className="space-y-2">
        <FormLabel>Peligros Identificados *</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Escriba un peligro y presione Enter"
            value={newHazard}
            onChange={(e) => setNewHazard(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newHazard, setHazards, () => setNewHazard(""))
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addItem(newHazard, setHazards, () => setNewHazard(""))}
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
                onClick={() => removeItem(index, setHazards)}
              />
            </Badge>
          ))}
        </div>
        <FormDescription>
          Ej: Chispas, Espacios confinados, Alturas, Químicos
        </FormDescription>
      </div>

      {/* Precautions */}
      <div className="space-y-2">
        <FormLabel>Precauciones Requeridas *</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Escriba una precaución y presione Enter"
            value={newPrecaution}
            onChange={(e) => setNewPrecaution(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newPrecaution, setPrecautions, () => setNewPrecaution(""))
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addItem(newPrecaution, setPrecautions, () => setNewPrecaution(""))}
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
                onClick={() => removeItem(index, setPrecautions)}
              />
            </Badge>
          ))}
        </div>
        <FormDescription>
          Ej: Ventilación adecuada, Señalización, Extintor cercano
        </FormDescription>
      </div>

      {/* PPE */}
      <div className="space-y-2">
        <FormLabel>EPP Requerido *</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Escriba un EPP y presione Enter"
            value={newPPE}
            onChange={(e) => setNewPPE(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newPPE, setPPE, () => setNewPPE(""))
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addItem(newPPE, setPPE, () => setNewPPE(""))}
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
                onClick={() => removeItem(index, setPPE)}
              />
            </Badge>
          ))}
        </div>
        <FormDescription>
          Ej: Casco, Guantes aislantes, Careta de soldadura, Arnés
        </FormDescription>
      </div>
    </div>
  )
}
