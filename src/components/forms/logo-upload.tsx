"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface LogoUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function LogoUpload({ value, onChange, onRemove }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'client-company-logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onChange(result.url)
        toast.success('Logo subido exitosamente')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Logo de la Empresa (Opcional)</Label>
      <div className="flex items-start space-x-4">
        {value ? (
          <div className="relative">
            <div className="w-20 h-20 border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <Image
                src={value}
                alt="Vista previa del logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleLogoUpload(file)
              }
            }}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {uploading ? "Subiendo..." : "Suba un logo de empresa (PNG, JPG, o SVG)"}
          </p>
        </div>
      </div>
    </div>
  )
}