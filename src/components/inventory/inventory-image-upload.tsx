"use client"

import { useState } from "react"
import { Upload, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InventoryImagePreview } from "./inventory-image-preview"

interface InventoryImageUploadProps {
  images: string[]
  companyId: string
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function InventoryImageUpload({
  images,
  companyId,
  onImagesChange,
  maxImages = 5
}: InventoryImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('companyId', companyId)

        const response = await fetch('/api/inventory/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al subir imagen')
        }

        const data = await response.json()
        return data.url
      })

      const newUrls = await Promise.all(uploadPromises)
      onImagesChange([...images, ...newUrls])
      toast.success(`${newUrls.length} imagen(es) subida(s) exitosamente`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    toast.success('Imagen eliminada')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Imágenes del producto ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <label htmlFor="inventory-image-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir imagen
                  </>
                )}
              </span>
            </Button>
            <input
              id="inventory-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <InventoryImagePreview
              key={index}
              imageUrl={imageUrl}
              onRemove={() => handleRemoveImage(index)}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">No hay imágenes</p>
          <p className="text-xs mt-1">Sube hasta {maxImages} imágenes del producto</p>
        </div>
      )}
    </div>
  )
}
