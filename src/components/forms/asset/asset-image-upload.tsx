"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignedImage } from "@/components/signed-image"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface AssetImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  clientCompanyId: string
  assetId?: string
}

export function AssetImageUpload({ 
  value = [], 
  onChange, 
  clientCompanyId,
  assetId = "new" 
}: AssetImageUploadProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientCompanyId', clientCompanyId)
      formData.append('assetId', assetId)

      const response = await fetch('/api/upload/asset-images', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const newImages = [...value, result.url]
        onChange(newImages)
        toast.success('Imagen subida exitosamente')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <Label>Imágenes del Activo (Opcional)</Label>
      
      {/* Display existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square border border-border rounded-lg overflow-hidden bg-muted">
                <SignedImage
                  src={imageUrl}
                  alt={`Asset image ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploadingImage ? "Subiendo..." : "Subir Imagen"}
        </Button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-muted-foreground">
        Puede subir múltiples imágenes del activo (PNG, JPG, WEBP, GIF). Máximo 2MB por imagen.
      </p>
    </div>
  )
}