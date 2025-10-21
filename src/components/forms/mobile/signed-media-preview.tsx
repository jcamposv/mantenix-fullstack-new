"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Play, FileImage, FileVideo, Loader2 } from "lucide-react"
import { useWorkOrderMediaSignedUrl } from "@/hooks/use-work-order-media-signed-url"

interface SignedMediaPreviewProps {
  files: File[]
  urls?: string[]
  fieldType: "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"
  onRemove?: (index: number) => void
  readOnly?: boolean
}

export function SignedMediaPreview({ 
  files, 
  urls = [],
  fieldType, 
  onRemove,
  readOnly = false
}: SignedMediaPreviewProps) {
  const isVideo = fieldType.includes("VIDEO")
  
  if (files.length === 0 && urls.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Render uploaded URLs with signed URLs */}
      {urls.map((url, index) => (
        <SignedMediaItem
          key={`url-${index}`}
          url={url}
          isVideo={isVideo}
          onRemove={onRemove ? () => onRemove(index) : undefined}
          readOnly={readOnly}
        />
      ))}
      
      {/* Render local files (for preview before upload) */}
      {files.map((file, index) => (
        <LocalMediaItem
          key={`file-${index}`}
          file={file}
          isVideo={isVideo}
          onRemove={onRemove ? () => onRemove(urls.length + index) : undefined}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

function SignedMediaItem({ 
  url, 
  isVideo, 
  onRemove, 
  readOnly 
}: { 
  url: string
  isVideo: boolean
  onRemove?: () => void
  readOnly: boolean
}) {
  const { signedUrl, loading, error } = useWorkOrderMediaSignedUrl(url)

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

  return (
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
  const [objectUrl, setObjectUrl] = useState<string>(() => URL.createObjectURL(file))

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