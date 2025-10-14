import { useState, useEffect } from "react"
import { toast } from "sonner"

interface UseTableDataOptions<T> {
  endpoint: string
  transform?: (data: unknown) => T[]
  dependencies?: unknown[]
}

export function useTableData<T>({ endpoint, transform, dependencies = [] }: UseTableDataOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Handle paginated responses
      const items = result.items || result.companies || result.users || result.sites || result
      const transformedData = transform ? transform(items) : items
      
      setData(transformedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar datos"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch, setData }
}