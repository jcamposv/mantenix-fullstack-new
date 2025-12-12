/**
 * Common Types
 * Shared type definitions used across the application
 */

/**
 * Generic paginated response interface
 * Standardized format for all paginated API responses
 *
 * @template T - The type of items in the response
 *
 * @example
 * ```typescript
 * interface WorkOrdersResponse extends PaginatedResponse<WorkOrderWithRelations> {}
 * // Returns: { items: WorkOrderWithRelations[], total: 10, page: 1, limit: 20, totalPages: 1 }
 * ```
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  items: T[]

  /** Total number of items across all pages */
  total: number

  /** Current page number (1-indexed) */
  page: number

  /** Number of items per page */
  limit: number

  /** Total number of pages */
  totalPages: number
}

/**
 * Generic API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

/**
 * Union type for API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse
