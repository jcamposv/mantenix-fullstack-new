/**
 * useDialogState Hook
 * Manages dialog open/close state with associated data
 */

import { useState, useCallback } from 'react';

interface UseDialogStateReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
}

/**
 * Custom hook for managing dialog state with optional associated data
 * Follows Single Responsibility Principle by isolating dialog state management
 *
 * @template T - Type of data associated with the dialog
 * @returns Object with dialog state and control functions
 *
 * @example
 * const preview = useDialogState<string>();
 * // Open dialog with data
 * preview.open('work-order-123');
 * // Close dialog
 * preview.close();
 * // Access current state
 * if (preview.isOpen) { ... }
 */
export function useDialogState<T = unknown>(): UseDialogStateReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Keep data until next open to prevent flash of empty content
    // Data will be replaced on next open
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
}
