// Media item for custom fields with optional notes
export interface MediaItem {
  url: string
  note?: string
}

// Type guard to check if value is a MediaItem
export function isMediaItem(value: unknown): value is MediaItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof (value as MediaItem).url === 'string'
  )
}

// Type guard to check if value is an array of MediaItems
export function isMediaItemArray(value: unknown): value is MediaItem[] {
  return Array.isArray(value) && value.every(isMediaItem)
}

// Helper to normalize media values (handles both old format with just URLs and new format with MediaItems)
export function normalizeMediaValue(value: unknown): MediaItem[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        // Old format: just a URL string
        return { url: item }
      } else if (isMediaItem(item)) {
        // New format: MediaItem object
        return item
      }
      return { url: '' }
    }).filter(item => item.url !== '')
  }

  if (typeof value === 'string') {
    return [{ url: value }]
  }

  if (isMediaItem(value)) {
    return [value]
  }

  return []
}

// Helper to extract just URLs from MediaItems (for backward compatibility)
export function extractUrls(items: MediaItem[]): string[] {
  return items.map(item => item.url)
}
