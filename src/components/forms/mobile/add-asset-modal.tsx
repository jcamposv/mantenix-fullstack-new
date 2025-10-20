"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { AssetBasicInfo } from "@/components/forms/asset/asset-basic-info"
import { AssetTechnicalInfo } from "@/components/forms/asset/asset-technical-info"
import { Loader2 } from "lucide-react"
import { assetSchema, type AssetFormData } from "@/schemas/asset"
import { toast } from "sonner"

interface AddAssetModalProps {
  siteId: string
  onAssetCreated?: () => void
  trigger?: React.ReactNode
}

export function AddAssetModal({ siteId, onAssetCreated, trigger }: AddAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      location: "",
      siteId: siteId,
      status: "OPERATIVO",
      category: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      estimatedLifespan: undefined
    }
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el activo')
      }

      await response.json()
      
      toast.success('Activo creado exitosamente')
      onAssetCreated?.()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating asset:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el activo')
    } finally {
      setLoading(false)
    }
  })

  const sites = [{ id: siteId, name: "Sede actual" }]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Agregar Activo</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Activo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AssetBasicInfo 
              form={form} 
              sites={sites}
              loadingSites={false}
            />
            
            <AssetTechnicalInfo form={form} />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Activo'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}