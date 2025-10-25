"use client"

import { MediaDisplay } from "./media-display"
import { normalizeMediaValue, type MediaItem } from "@/types/media.types"
import type { CustomField } from "@/schemas/work-order-template"

interface CustomFieldValueProps {
  field: CustomField
  value: unknown
}

export function CustomFieldValue({ field, value }: CustomFieldValueProps) {
  if (!value) return <span className="text-sm text-muted-foreground">N/A</span>

  switch (field.type) {
    case "IMAGE_BEFORE":
    case "IMAGE_AFTER":
    case "VIDEO_BEFORE":
    case "VIDEO_AFTER":
      const mediaItems = normalizeMediaValue(value)
      return (
        <div className="flex flex-wrap gap-2">
          {mediaItems.map((item, index) => (
            <MediaDisplay
              key={index}
              url={item.url}
              isVideo={field.type.includes("VIDEO")}
              fieldLabel={`${field.label} ${mediaItems.length > 1 ? `(${index + 1})` : ''}`}
              note={item.note}
            />
          ))}
        </div>
      )
    
    case "CHECKLIST":
      const checkedItems = Array.isArray(value) ? value : []
      return (
        <div className="space-y-1">
          {field.options?.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                checkedItems.includes(option) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                checkedItems.includes(option) ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {option}
              </span>
            </div>
          ))}
        </div>
      )
    
    case "CHECKBOX":
      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-sm">
            {value ? (field.options?.[0] || 'Sí') : 'No'}
          </span>
        </div>
      )
    
    case "SELECT":
    case "RADIO":
      return <span className="text-sm">{value.toString()}</span>
    
    case "DATE":
      const date = new Date(value as string)
      return <span className="text-sm">{date.toLocaleDateString()}</span>
    
    case "DATETIME":
      const datetime = new Date(value as string)
      return <span className="text-sm">{datetime.toLocaleString()}</span>
    
    case "TIME":
      return <span className="text-sm">{value.toString()}</span>
    
    default:
      return <span className="text-sm">{value.toString()}</span>
  }
}