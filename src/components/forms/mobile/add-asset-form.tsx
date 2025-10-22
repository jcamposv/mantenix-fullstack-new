"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Camera } from "lucide-react"
import type { Asset } from "@/types/asset.types"

interface AddAssetFormProps {
  siteId: string
  onAssetCreated?: (asset: Asset) => void
  trigger?: React.ReactNode
}

export function AddAssetForm({ siteId, onAssetCreated, trigger }: AddAssetFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "",
    serialNumber: "",
    manufacturer: "",
    category: "",
    location: "",
    purchaseDate: "",
    warranty: "",
    notes: ""
  })
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Add basic asset data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value)
      })
      
      formDataToSend.append('siteId', siteId)
      
      // Add image if present
      if (image) {
        formDataToSend.append('image', image)
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Error al crear el activo')
      }

      const newAsset = await response.json()
      onAssetCreated?.(newAsset)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        model: "",
        serialNumber: "",
        manufacturer: "",
        category: "",
        location: "",
        purchaseDate: "",
        warranty: "",
        notes: ""
      })
      setImage(null)
      setOpen(false)
    } catch (error) {
      console.error('Error creating asset:', error)
      alert('Error al crear el activo')
    } finally {
      setLoading(false)
    }
  }

  const handleImageCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        setImage(target.files[0])
      }
    }
    input.click()
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Agregar Máquina
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Máquina/Activo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Activo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Compresor A/C Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="ELECTRICIDAD">Electricidad</SelectItem>
                <SelectItem value="PLOMERIA">Plomería</SelectItem>
                <SelectItem value="MAQUINARIA">Maquinaria</SelectItem>
                <SelectItem value="SEGURIDAD">Seguridad</SelectItem>
                <SelectItem value="ILUMINACION">Iluminación</SelectItem>
                <SelectItem value="OTROS">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Marca</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="Ej: Carrier"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Ej: 30HX-015"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Número de Serie</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="Número de serie del equipo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ej: Azotea, Sótano, Sala de máquinas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada del activo"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Fecha de Compra</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Garantía (meses)</Label>
              <Input
                id="warranty"
                type="number"
                value={formData.warranty}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                placeholder="24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto del Activo</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleImageCapture}
            >
              <Camera className="mr-2 h-4 w-4" />
              {image ? "Cambiar Foto" : "Tomar Foto"}
            </Button>
            {image && (
              <div className="mt-2">
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Vista previa"
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded border"
                  unoptimized
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Cualquier información adicional relevante"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.name}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Activo"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}