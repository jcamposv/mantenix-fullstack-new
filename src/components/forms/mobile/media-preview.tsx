"use client"

import Image from "next/image"
import { X, Check } from "lucide-react"

type MediaFieldType = "IMAGE_BEFORE" | "IMAGE_AFTER" | "VIDEO_BEFORE" | "VIDEO_AFTER"

interface MediaPreviewProps {
  files: File[]
  fieldType: MediaFieldType
  onRemove?: (index: number) => void
  readOnly?: boolean
}

export function MediaPreview({ 
  files, 
  fieldType, 
  onRemove, 
  readOnly = false 
}: MediaPreviewProps) {
  const isVideo = fieldType.includes("VIDEO")

  if (!files || files.length === 0) return null

  return (
    <div className={`grid gap-2 ${files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {files.map((file, index) => (
        <div key={index} className="relative group">
          {isVideo ? (
            <video
              src={URL.createObjectURL(file)}
              className="w-full h-32 object-cover rounded-lg border"
              controls
              preload="metadata"
            />
          ) : (
            <Image
              src={URL.createObjectURL(file)}
              alt={`${fieldType} ${index + 1}`}
              width={200}
              height={96}
              className="w-full h-24 object-cover rounded-lg border"
              unoptimized
            />
          )}
          
          {/* Success indicator */}
          <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>

          {/* Remove button - only show when not readonly */}
          {!readOnly && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(index)
              }}
              className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* File info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
            <div className="truncate">{file.name}</div>
            <div>{(file.size / 1024 / 1024).toFixed(1)} MB</div>
          </div>
        </div>
      ))}
    </div>
  )
}