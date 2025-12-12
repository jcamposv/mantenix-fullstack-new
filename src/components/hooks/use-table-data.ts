import { useMemo } from "react"
import { toast } from "sonner"
import useSWR from "swr"

interface UseTableDataOptions<T> {
  endpoint: string
  transform?: (data: unknown) => T[]
  dependencies?: unknown[]
  // SWR options for advanced use cases
  revalidateOnFocus?: boolean
  refreshInterval?: number
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export function useTableData<T>({
  endpoint,
  transform,
  dependencies = [],
  revalidateOnFocus = false,
  refreshInterval = 0,
}: UseTableDataOptions<T>) {
  // Create a stable key that includes dependencies for cache invalidation
  // When dependencies change, SWR will refetch automatically
  const cacheKey = useMemo(() => {
    if (dependencies.length === 0) return endpoint
    // Serialize dependencies to create unique cache key
    return `${endpoint}__${JSON.stringify(dependencies)}`
  }, [endpoint, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  // Use SWR with automatic caching and deduplication
  const { data: rawData, error: swrError, isLoading, mutate } = useSWR(
    cacheKey,
    () => fetcher(endpoint),
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      onError: (err) => {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar datos"
        toast.error(errorMessage)
        console.error("Error fetching table data:", err)
      }
    }
  )

  // Transform data if needed
  const data = useMemo(() => {
    if (!rawData) return []

    if (transform) {
      return transform(rawData)
    }

    // Use standardized 'items' property from paginated responses
    return rawData.items || rawData
  }, [rawData, transform])

  const error = swrError?.message ?? null

  // Refetch function that triggers SWR revalidation
  const refetch = async () => {
    await mutate()
  }

  // setData function for manual updates (useful for optimistic updates)
  const setData = (newData: T[] | ((prev: T[]) => T[])) => {
    const updatedData = typeof newData === 'function' ? newData(data) : newData

    // Update SWR cache optimistically
    mutate(
      transform ? rawData : { items: updatedData },
      false // Don't revalidate immediately
    )
  }

  return {
    data,
    loading: isLoading,
    error,
    refetch,
    setData
  }
}