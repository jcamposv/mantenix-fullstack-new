/**
 * useCalendarRefetch Hook
 * Manages calendar refetch functionality without using refs
 */

import { useState, useCallback } from 'react';

interface UseCalendarRefetchReturn {
  triggerRefetch: () => void;
  refetchKey: number;
}

/**
 * Custom hook for managing calendar refetch without anti-pattern refs
 * Uses a key-based approach to trigger refetches
 *
 * @returns Object with refetch trigger function and key
 *
 * @example
 * const { triggerRefetch, refetchKey } = useCalendarRefetch();
 * // Pass refetchKey to calendar component
 * <Calendar key={refetchKey} />
 * // Trigger refetch after operation
 * await createWorkOrder();
 * triggerRefetch();
 */
export function useCalendarRefetch(): UseCalendarRefetchReturn {
  const [refetchKey, setRefetchKey] = useState(0);

  const triggerRefetch = useCallback(() => {
    setRefetchKey((prev) => prev + 1);
  }, []);

  return {
    triggerRefetch,
    refetchKey,
  };
}
