"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "@/components/common/user-avatar"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ProfilePhotoUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onRemove: () => void
  userName?: string
  mode?: "form" | "profile" // "form" = admin editing user, "profile" = user editing own profile
}

export function ProfilePhotoUpload({
  value,
  onChange,
  onRemove,
  userName = "Usuario",
  mode = "form" // Default to form mode (don't update DB immediately)
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (file: File) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("La imagen no debe superar 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten archivos de imagen")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Si mode="profile", actualizar DB inmediatamente
      // Si mode="form", solo subir a S3 sin actualizar DB
      if (mode === "form") {
        formData.append('updateUser', 'false')
      }

      const response = await fetch('/api/user/profile-photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        // En modo "form", result.url contiene solo la URL
        // En modo "profile", result.user.image contiene la URL
        const imageUrl = mode === "form" ? result.url : result.user?.image
        onChange(imageUrl)
        toast.success('Foto de perfil subida exitosamente')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir la foto')
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir la foto de perfil')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Foto de Perfil (Opcional)</Label>
      <div className="flex items-start space-x-4">
        <div className="relative">
          <UserAvatar
            name={userName}
            image={value}
            size="lg"
          />
          {value && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {!value && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handlePhotoUpload(file)
              }
              // Reset input to allow selecting the same file again
              e.target.value = ''
            }}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {uploading ? "Subiendo..." : "Suba una foto de perfil (PNG, JPG, WEBP o GIF). Máximo 5MB."}
          </p>
        </div>
      </div>
    </div>
  )
}
