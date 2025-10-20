"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Video, Image, Folder } from "lucide-react"

type MediaFieldType = "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"

interface MediaCaptureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fieldType: MediaFieldType
  multiple?: boolean
  onFilesSelected: (files: FileList | null) => void
}

export function MediaCaptureModal({ 
  open, 
  onOpenChange, 
  fieldType, 
  multiple = false, 
  onFilesSelected 
}: MediaCaptureModalProps) {
  const isVideo = fieldType.includes("VIDEO")
  const accept = isVideo ? "video/*" : "image/*"
  
  const handleCameraCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.capture = 'environment' // Usar cámara trasera
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      onFilesSelected(target.files)
    }
    input.click()
  }

  const handleGallerySelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    // Sin capture para permitir selección de galería
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      onFilesSelected(target.files)
    }
    input.click()
  }

  const getLabels = () => {
    if (isVideo) {
      return {
        title: fieldType === "VIDEO_BEFORE" ? "Grabar Video Antes" : "Grabar Video Después",
        cameraAction: "Grabar Video",
        galleryAction: "Seleccionar de Galería",
        cameraDesc: "Usar cámara del dispositivo",
        galleryDesc: "Seleccionar video existente"
      }
    }
    return {
      title: fieldType === "IMAGE_BEFORE" ? "Tomar Foto Antes" : "Tomar Foto Después",
      cameraAction: "Tomar Foto",
      galleryAction: "Seleccionar de Galería", 
      cameraDesc: "Usar cámara del dispositivo",
      galleryDesc: "Seleccionar imagen existente"
    }
  }

  const labels = getLabels()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isVideo ? (
              <Video className="h-5 w-5" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            {labels.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button
            onClick={handleCameraCapture}
            className="w-full justify-start h-12"
            variant="outline"
          >
            {isVideo ? (
              <Video className="mr-3 h-5 w-5" />
            ) : (
              <Camera className="mr-3 h-5 w-5" />
            )}
            <div className="text-left">
              <div className="font-medium">{labels.cameraAction}</div>
              <div className="text-xs text-muted-foreground">
                {labels.cameraDesc}
              </div>
            </div>
          </Button>

          <Button
            onClick={handleGallerySelect}
            className="w-full justify-start h-12"
            variant="outline"
          >
            {isVideo ? (
              <Folder className="mr-3 h-5 w-5" />
            ) : (
              <Image className="mr-3 h-5 w-5" />
            )}
            <div className="text-left">
              <div className="font-medium">{labels.galleryAction}</div>
              <div className="text-xs text-muted-foreground">
                {labels.galleryDesc}
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}