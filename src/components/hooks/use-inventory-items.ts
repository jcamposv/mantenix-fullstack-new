import { useState, useEffect } from "react"

export interface InventoryItem {
  id: string
  code: string
  name: string
  unit: string
  category?: string
  unitCost?: number
  totalAvailable?: number
  totalQuantity?: number
}

export function useInventoryItems(companyId?: string) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [companyId])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('limit', '1000') // Get all items
      if (companyId) {
        params.append('companyId', companyId)
      }

      const response = await fetch(`/api/admin/inventory/items?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Error al cargar los ítems de inventario')
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  return { items, loading, error, refetch: fetchItems }
}
