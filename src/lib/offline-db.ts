/**
 * Offline Database with Dexie.js
 *
 * Provides typed IndexedDB storage for offline-first PWA functionality.
 * Stores work orders, assets, and pending mutations for sync.
 *
 * Following Next.js Expert standards:
 * - Type-safe with no `any`
 * - Clean, focused responsibility
 * - Singleton pattern for database instance
 */

import Dexie, { type Table } from "dexie"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { AssetWithRelations } from "@/types/asset.types"

// ============================================================================
// OFFLINE DATA TYPES
// ============================================================================

/**
 * Cached work order with sync metadata
 */
export interface OfflineWorkOrder {
  id: string
  data: WorkOrderWithRelations
  syncedAt: number
  pendingSync: boolean
}

/**
 * Cached asset with sync metadata
 */
export interface OfflineAsset {
  id: string
  data: AssetWithRelations
  syncedAt: number
  pendingSync: boolean
}

/**
 * Pending mutation for background sync
 */
export interface PendingMutation {
  id?: number
  type: "CREATE" | "UPDATE" | "DELETE"
  entity: "workOrder" | "alert" | "timeLog" | "asset"
  entityId?: string
  payload: {
    url: string
    method: "POST" | "PUT" | "PATCH" | "DELETE"
    body: unknown
  }
  createdAt: number
  status: "pending" | "syncing" | "completed" | "failed"
  retryCount: number
  errorMessage?: string
}

/**
 * Sync metadata for tracking last sync times
 */
export interface SyncMeta {
  key: string
  lastSyncAt: number
  itemCount: number
}

// ============================================================================
// DEXIE DATABASE CLASS
// ============================================================================

/**
 * MantenixOfflineDB - Dexie database for offline storage
 *
 * Tables:
 * - workOrders: Cached work orders for offline viewing
 * - assets: Cached assets for offline viewing
 * - pendingMutations: Queue of mutations to sync when online
 * - syncMeta: Metadata about sync status per entity type
 */
class MantenixOfflineDB extends Dexie {
  workOrders!: Table<OfflineWorkOrder, string>
  assets!: Table<OfflineAsset, string>
  pendingMutations!: Table<PendingMutation, number>
  syncMeta!: Table<SyncMeta, string>

  constructor() {
    super("mantenix-offline")

    this.version(1).stores({
      // Primary key is 'id', indexed by syncedAt and pendingSync
      workOrders: "id, syncedAt, pendingSync",
      // Primary key is 'id', indexed by syncedAt
      assets: "id, syncedAt, pendingSync",
      // Auto-increment id, indexed by status, entity, and createdAt
      pendingMutations: "++id, status, entity, createdAt",
      // Primary key is 'key' (entity type name)
      syncMeta: "key",
    })
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton database instance
 * Only create in browser environment
 */
export const offlineDB =
  typeof window !== "undefined" ? new MantenixOfflineDB() : null

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if offline database is available
 */
export function isOfflineDBAvailable(): boolean {
  return typeof window !== "undefined" && offlineDB !== null
}

/**
 * Clear all offline data (useful for logout)
 */
export async function clearAllOfflineData(): Promise<void> {
  if (!offlineDB) return

  await Promise.all([
    offlineDB.workOrders.clear(),
    offlineDB.assets.clear(),
    offlineDB.pendingMutations.clear(),
    offlineDB.syncMeta.clear(),
  ])
}

/**
 * Get count of pending mutations
 */
export async function getPendingMutationsCount(): Promise<number> {
  if (!offlineDB) return 0
  return offlineDB.pendingMutations.where("status").equals("pending").count()
}

/**
 * Get all pending mutations for sync
 */
export async function getPendingMutations(): Promise<PendingMutation[]> {
  if (!offlineDB) return []
  return offlineDB.pendingMutations.where("status").equals("pending").toArray()
}

/**
 * Update mutation status
 */
export async function updateMutationStatus(
  id: number,
  status: PendingMutation["status"],
  errorMessage?: string
): Promise<void> {
  if (!offlineDB) return

  const updates: Partial<PendingMutation> = { status }
  if (errorMessage) {
    updates.errorMessage = errorMessage
  }
  if (status === "failed") {
    const mutation = await offlineDB.pendingMutations.get(id)
    if (mutation) {
      updates.retryCount = mutation.retryCount + 1
    }
  }

  await offlineDB.pendingMutations.update(id, updates)
}

/**
 * Delete completed mutations (cleanup)
 */
export async function deleteCompletedMutations(): Promise<number> {
  if (!offlineDB) return 0
  return offlineDB.pendingMutations.where("status").equals("completed").delete()
}

/**
 * Delete failed mutations that exceeded max retries
 */
export async function deleteFailedMutations(maxRetries: number = 3): Promise<number> {
  if (!offlineDB) return 0

  const failedMutations = await offlineDB.pendingMutations
    .where("status")
    .equals("failed")
    .toArray()

  const toDelete = failedMutations
    .filter(m => m.retryCount >= maxRetries)
    .map(m => m.id!)
    .filter(Boolean)

  if (toDelete.length > 0) {
    await offlineDB.pendingMutations.bulkDelete(toDelete)
  }

  return toDelete.length
}

/**
 * Get sync metadata for an entity type
 */
export async function getSyncMeta(key: string): Promise<SyncMeta | undefined> {
  if (!offlineDB) return undefined
  return offlineDB.syncMeta.get(key)
}

/**
 * Update sync metadata
 */
export async function updateSyncMeta(
  key: string,
  itemCount: number
): Promise<void> {
  if (!offlineDB) return

  await offlineDB.syncMeta.put({
    key,
    lastSyncAt: Date.now(),
    itemCount,
  })
}

/**
 * Check if data is stale based on stale time
 */
export async function isDataStale(
  key: string,
  staleTime: number
): Promise<boolean> {
  const meta = await getSyncMeta(key)
  if (!meta) return true
  return Date.now() - meta.lastSyncAt > staleTime
}

// ============================================================================
// SINGLE ENTITY HELPERS
// ============================================================================

/**
 * Get a single work order from offline cache
 */
export async function getOfflineWorkOrder(
  id: string
): Promise<WorkOrderWithRelations | null> {
  if (!offlineDB) return null
  const cached = await offlineDB.workOrders.get(id)
  return cached?.data ?? null
}

/**
 * Save or update a single work order in offline cache
 */
export async function saveOfflineWorkOrder(
  workOrder: WorkOrderWithRelations
): Promise<void> {
  if (!offlineDB) return

  await offlineDB.workOrders.put({
    id: workOrder.id,
    data: workOrder,
    syncedAt: Date.now(),
    pendingSync: false,
  })
}

/**
 * Update work order data locally (optimistic update)
 * Marks it as pending sync
 */
export async function updateOfflineWorkOrder(
  id: string,
  updates: Partial<WorkOrderWithRelations>
): Promise<WorkOrderWithRelations | null> {
  if (!offlineDB) return null

  const cached = await offlineDB.workOrders.get(id)
  if (!cached) return null

  const updatedData = {
    ...cached.data,
    ...updates,
  } as WorkOrderWithRelations

  await offlineDB.workOrders.put({
    id,
    data: updatedData,
    syncedAt: cached.syncedAt,
    pendingSync: true,
  })

  return updatedData
}

/**
 * Get a single asset from offline cache
 */
export async function getOfflineAsset(
  id: string
): Promise<AssetWithRelations | null> {
  if (!offlineDB) return null
  const cached = await offlineDB.assets.get(id)
  return cached?.data ?? null
}

/**
 * Save or update a single asset in offline cache
 */
export async function saveOfflineAsset(
  asset: AssetWithRelations
): Promise<void> {
  if (!offlineDB) return

  await offlineDB.assets.put({
    id: asset.id,
    data: asset,
    syncedAt: Date.now(),
    pendingSync: false,
  })
}

/**
 * Add a mutation to the pending queue
 */
export async function queueMutation(
  mutation: Omit<PendingMutation, "id" | "createdAt" | "status" | "retryCount">
): Promise<number | undefined> {
  if (!offlineDB) return undefined

  return offlineDB.pendingMutations.add({
    ...mutation,
    createdAt: Date.now(),
    status: "pending",
    retryCount: 0,
  })
}
