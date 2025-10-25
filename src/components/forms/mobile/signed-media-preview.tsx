"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Play, FileImage, FileVideo, Loader2, StickyNote } from "lucide-react"
import { useWorkOrderMediaSignedUrl } from "@/hooks/use-work-order-media-signed-url"
import type { MediaItem } from "@/types/media.types"

interface SignedMediaPreviewProps {
  files: File[]
  mediaItems?: MediaItem[]
  fieldType: "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"
  onRemove?: (index: number) => void
  onNoteChange?: (index: number, note: string) => void
  readOnly?: boolean
}

export function SignedMediaPreview({
  files,
  mediaItems = [],
  fieldType,
  onRemove,
  onNoteChange,
  readOnly = false
}: SignedMediaPreviewProps) {
  const isVideo = fieldType.includes("VIDEO")

  if (files.length === 0 && mediaItems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Render uploaded media items with signed URLs */}
      {mediaItems.map((item, index) => (
        <SignedMediaItem
          key={`url-${index}`}
          mediaItem={item}
          isVideo={isVideo}
          onRemove={onRemove ? () => onRemove(index) : undefined}
          onNoteChange={onNoteChange ? (note) => onNoteChange(index, note) : undefined}
          readOnly={readOnly}
        />
      ))}

      {/* Render local files (for preview before upload) */}
      {files.map((file, index) => (
        <LocalMediaItem
          key={`file-${index}`}
          file={file}
          isVideo={isVideo}
          onRemove={onRemove ? () => onRemove(mediaItems.length + index) : undefined}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

function SignedMediaItem({
  mediaItem,
  isVideo,
  onRemove,
  onNoteChange,
  readOnly
}: {
  mediaItem: MediaItem
  isVideo: boolean
  onRemove?: () => void
  onNoteChange?: (note: string) => void
  readOnly: boolean
}) {
  const { signedUrl, loading, error } = useWorkOrderMediaSignedUrl(mediaItem.url)
  const [localNote, setLocalNote] = useState(mediaItem.note || "")

  if (loading) {
    return (
      <div className="relative aspect-square bg-muted rounded-lg border flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !signedUrl) {
    return (
      <div className="relative aspect-square bg-muted rounded-lg border flex flex-col items-center justify-center">
        {isVideo ? (
          <FileVideo className="h-8 w-8 text-muted-foreground mb-2" />
        ) : (
          <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
        )}
        <span className="text-xs text-muted-foreground text-center px-2">
          Error cargando archivo
        </span>
        {onRemove && !readOnly && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  const handleNoteBlur = () => {
    if (onNoteChange && localNote !== mediaItem.note) {
      onNoteChange(localNote)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-square">
        {isVideo ? (
          <div className="relative w-full h-full bg-black rounded-lg border overflow-hidden">
            <video
              src={signedUrl}
              className="w-full h-full object-cover"
              controls={false}
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
        ) : (
          <Image
            src={signedUrl}
            alt="Imagen subida"
            fill
            className="object-cover rounded-lg border"
            quality={75}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {onRemove && !readOnly && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Note input/display */}
      {!readOnly && onNoteChange ? (
        <div className="relative">
          <StickyNote className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Agregar nota..."
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={handleNoteBlur}
            className="pl-8 text-sm"
          />
        </div>
      ) : localNote ? (
        <div className="flex items-start gap-2 p-2 bg-muted rounded-md">
          <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{localNote}</p>
        </div>
      ) : null}
    </div>
  )
}

function LocalMediaItem({ 
  file, 
  isVideo, 
  onRemove, 
  readOnly 
}: { 
  file: File
  isVideo: boolean
  onRemove?: () => void
  readOnly: boolean
}) {
  const [objectUrl] = useState<string>(() => URL.createObjectURL(file))

  return (
    <div className="relative aspect-square">
      {isVideo ? (
        <div className="relative w-full h-full bg-black rounded-lg border overflow-hidden">
          <video
            src={objectUrl}
            className="w-full h-full object-cover"
            controls={false}
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </div>
      ) : (
        <Image
          src={objectUrl}
          alt={file.name}
          fill
          className="object-cover rounded-lg border"
          quality={75}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      )}
      
      <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded truncate">
        {file.name}
      </div>
      
      {onRemove && !readOnly && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}