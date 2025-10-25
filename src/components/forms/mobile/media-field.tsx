"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Camera, Video, Loader2 } from "lucide-react"
import { MediaCaptureModal } from "./media-capture-modal"
import { SignedMediaPreview } from "./signed-media-preview"
import { compressImage, shouldCompressImage } from "@/lib/image-compression"
import { normalizeMediaValue, type MediaItem } from "@/types/media.types"
import type { CustomField } from "@/schemas/work-order-template"

interface MediaFieldProps {
  field: CustomField
  workOrderId: string
  readOnly?: boolean
}

export function MediaField({ field, workOrderId, readOnly = false }: MediaFieldProps) {
  const form = useFormContext()
  const [showModal, setShowModal] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  // Get existing media items from form and normalize them
  const rawValue = form.watch(`customFieldValues.${field.id}`)
  const mediaItems: MediaItem[] = normalizeMediaValue(rawValue)

  const isVideo = field.type.includes("VIDEO")

  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('workOrderId', workOrderId)
      formData.append('fieldId', field.id)
      formData.append('fieldType', field.type)

      const response = await fetch('/api/work-orders/media/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`)
      }

      const result = await response.json()
      return result.url
    })

    return Promise.all(uploadPromises)
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setShowModal(false)
    setUploading(true)

    try {
      // Compress large images before upload
      const processedFiles = await Promise.all(
        fileArray.map(async (file) => {
          if (shouldCompressImage(file)) {
            try {
              return await compressImage(file)
            } catch (error) {
              console.warn('Failed to compress image, using original:', error)
              return file
            }
          }
          return file
        })
      )

      setMediaFiles(processedFiles)
      const urls = await uploadFiles(processedFiles)

      // Create new MediaItems from uploaded URLs
      const newMediaItems: MediaItem[] = urls.map(url => ({ url }))
      const allMediaItems = [...mediaItems, ...newMediaItems]

      form.setValue(`customFieldValues.${field.id}`, allMediaItems)
      setMediaFiles([]) // Clear local files after upload
    } catch (error) {
      console.error('Error uploading files:', error)
      // TODO: Add toast notification for error
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    const totalMediaItems = mediaItems.length

    if (index < totalMediaItems) {
      // Removing a media item
      const newMediaItems = mediaItems.filter((_, i) => i !== index)
      form.setValue(`customFieldValues.${field.id}`, newMediaItems.length > 0 ? newMediaItems : [])
    } else {
      // Removing a local file
      const fileIndex = index - totalMediaItems
      const newFiles = mediaFiles.filter((_, i) => i !== fileIndex)
      setMediaFiles(newFiles)
    }
  }

  const handleNoteChange = (index: number, note: string) => {
    const newMediaItems = [...mediaItems]
    newMediaItems[index] = {
      ...newMediaItems[index],
      note: note.trim() || undefined
    }
    form.setValue(`customFieldValues.${field.id}`, newMediaItems)
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
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isVideo ? (
            <Video className="mr-2 h-4 w-4" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Subiendo..." : getButtonLabel()}
        </Button>
      )}

      {(mediaItems.length > 0 || mediaFiles.length > 0) && (
        <SignedMediaPreview
          files={mediaFiles}
          mediaItems={mediaItems}
          fieldType={field.type as "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"}
          onRemove={readOnly ? undefined : handleRemoveFile}
          onNoteChange={readOnly ? undefined : handleNoteChange}
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