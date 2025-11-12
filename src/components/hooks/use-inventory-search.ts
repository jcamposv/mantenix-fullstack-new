import { useState, useEffect, useRef } from "react"

export interface InventoryItem {
  id: string
  code: string
  name: string
  unit: string
  category?: string
  company: {
    id: string
    name: string
  }
  totalAvailable?: number
}

export function useInventorySearch() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('search', searchQuery)
      params.append('limit', '50') // Limit results for performance
      params.append('isActive', 'true') // Only active items

      const response = await fetch(`/api/admin/inventory/items?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Error al buscar ítems')
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error searching inventory items:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const search = (query: string) => {
    setLoading(true)

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      performSearch(query)
    }, 300) // 300ms debounce
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return { items, loading, error, search }
}
