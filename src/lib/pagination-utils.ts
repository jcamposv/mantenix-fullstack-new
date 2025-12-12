/**
 * Pagination Utilities
 * Helper functions for standardized pagination responses
 * Following Next.js Expert patterns: type-safe, explicit, no any
 */

import type { PaginatedResponse } from "@/types/common.types"

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * Pagination result from database query
 */
export interface QueryResult<T> {
  items: T[]
  total: number
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

/**
 * Normalizes and validates pagination parameters
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Validated pagination parameters
 *
 * @example
 * ```typescript
 * const { page, limit, skip } = normalizePagination(2, 20)
 * // Returns: { page: 2, limit: 20, skip: 20 }
 * ```
 */
export function normalizePagination(
  page?: number | string | null,
  limit?: number | string | null
): {
  page: number
  limit: number
  skip: number
} {
  // Parse and validate page
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page
  const validPage = parsedPage && parsedPage > 0 ? parsedPage : DEFAULT_PAGE

  // Parse and validate limit
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit
  const validLimit = parsedLimit && parsedLimit > 0
    ? Math.min(parsedLimit, MAX_LIMIT)
    : DEFAULT_LIMIT

  // Calculate skip for database query
  const skip = (validPage - 1) * validLimit

  return {
    page: validPage,
    limit: validLimit,
    skip
  }
}

/**
 * Calculates total number of pages
 *
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 *
 * @example
 * ```typescript
 * calculateTotalPages(95, 20) // Returns: 5
 * calculateTotalPages(0, 20)  // Returns: 0
 * ```
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (total === 0) return 0
  return Math.ceil(total / limit)
}

/**
 * Creates a standardized paginated response
 *
 * @param items - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Standardized paginated response
 *
 * @example
 * ```typescript
 * const response = createPaginatedResponse(users, 95, 2, 20)
 * // Returns: {
 * //   items: [...],
 * //   total: 95,
 * //   page: 2,
 * //   limit: 20,
 * //   totalPages: 5
 * // }
 * ```
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit)
  }
}

/**
 * Creates a standardized paginated response from a query result
 * Convenience function that combines query result with pagination params
 *
 * @param queryResult - Result from database query with items and total
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Standardized paginated response
 *
 * @example
 * ```typescript
 * const queryResult = await db.findMany(...)
 * const response = toPaginatedResponse(queryResult, page, limit)
 * ```
 */
export function toPaginatedResponse<T>(
  queryResult: QueryResult<T>,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return createPaginatedResponse(
    queryResult.items,
    queryResult.total,
    page,
    limit
  )
}

/**
 * Extracts pagination parameters from URL search params
 * Useful for API routes that receive pagination via query string
 *
 * @param searchParams - URLSearchParams or Request object
 * @returns Normalized pagination parameters
 *
 * @example
 * ```typescript
 * // In API route
 * export async function GET(request: Request) {
 *   const { page, limit, skip } = getPaginationFromRequest(request)
 *   // Use page, limit, skip for database query
 * }
 * ```
 */
export function getPaginationFromRequest(
  request: Request
): {
  page: number
  limit: number
  skip: number
} {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')

  return normalizePagination(page, limit)
}

/**
 * Checks if there are more pages after the current one
 *
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @returns True if there are more pages
 */
export function hasNextPage(page: number, totalPages: number): boolean {
  return page < totalPages
}

/**
 * Checks if there are pages before the current one
 *
 * @param page - Current page number
 * @returns True if there are previous pages
 */
export function hasPreviousPage(page: number): boolean {
  return page > 1
}

/**
 * Gets the range of items being displayed
 * Useful for "Showing X-Y of Z results" messages
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Object with from, to, and total
 *
 * @example
 * ```typescript
 * const range = getPageRange(2, 20, 95)
 * // Returns: { from: 21, to: 40, total: 95 }
 * // Display: "Showing 21-40 of 95 results"
 * ```
 */
export function getPageRange(
  page: number,
  limit: number,
  total: number
): {
  from: number
  to: number
  total: number
} {
  if (total === 0) {
    return { from: 0, to: 0, total: 0 }
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return { from, to, total }
}
