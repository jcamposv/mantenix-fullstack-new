"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Camera, Video } from "lucide-react"
import { MediaCaptureModal } from "./media-capture-modal"
import { MediaPreview } from "./media-preview"
import type { CustomField } from "@/schemas/work-order-template"

interface MediaFieldProps {
  field: CustomField
  readOnly?: boolean
}

export function MediaField({ field, readOnly = false }: MediaFieldProps) {
  const form = useFormContext()
  const [showModal, setShowModal] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  
  const isVideo = field.type.includes("VIDEO")

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    setMediaFiles(fileArray)
    form.setValue(`customFieldValues.${field.id}`, fileArray)
    setShowModal(false)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    form.setValue(`customFieldValues.${field.id}`, newFiles.length > 0 ? newFiles : undefined)
  }

  const getButtonLabel = () => {
    if (isVideo) {
      return field.type === "VIDEO_BEFORE" ? "Grabar Video Antes" : "Grabar Video Después"
    }
    return field.type === "IMAGE_BEFORE" ? "Tomar Foto Antes" : "Tomar Foto Después"
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowModal(true)}
        >
          {isVideo ? (
            <Video className="mr-2 h-4 w-4" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {getButtonLabel()}
        </Button>
      )}

      {mediaFiles.length > 0 && (
        <MediaPreview 
          files={mediaFiles}
          fieldType={field.type as "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"}
          onRemove={readOnly ? undefined : handleRemoveFile}
          readOnly={readOnly}
        />
      )}

      <MediaCaptureModal
        open={showModal}
        onOpenChange={setShowModal}
        fieldType={field.type as "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"}
        multiple={field.multiple}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  )
}