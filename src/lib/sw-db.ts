/**
 * Service Worker IndexedDB Utilities
 *
 * Manages offline action queue using IndexedDB for PWA functionality
 * Stores failed requests for later sync when connection returns
 *
 * Following Next.js Expert standards:
 * - Under 150 lines for utility functions
 * - No `any` types
 * - Single responsibility
 * - Type-safe interfaces
 */

/// <reference lib="webworker" />

const DB_NAME = "mantenix-offline-db"
const DB_VERSION = 1
const STORE_NAME = "offline-actions"

export interface OfflineAction {
  id?: number
  url: string
  method: string
  headers: Record<string, string>
  body: string
  timestamp: number
  retryCount: number
}

/**
 * Open IndexedDB database with proper schema
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        })

        objectStore.createIndex("timestamp", "timestamp", { unique: false })
        objectStore.createIndex("url", "url", { unique: false })

        console.log("[SW DB] Object store created")
      }
    }
  })
}

/**
 * Add an offline action to the queue
 */
export async function addOfflineAction(
  action: Omit<OfflineAction, "id">
): Promise<number> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(action)

    request.onsuccess = () => {
      console.log("[SW DB] Action queued:", action.method, action.url)
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(new Error("Failed to add action"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Get all offline actions from the queue
 */
export async function getAllOfflineActions(): Promise<OfflineAction[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result as OfflineAction[])
    }

    request.onerror = () => {
      reject(new Error("Failed to get actions"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Delete an offline action from the queue
 */
export async function deleteOfflineAction(id: number): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      console.log("[SW DB] Action removed from queue:", id)
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to delete action"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Update retry count for an action
 */
export async function updateRetryCount(
  id: number,
  retryCount: number
): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const action = getRequest.result as OfflineAction | undefined

      if (!action) {
        reject(new Error("Action not found"))
        return
      }

      action.retryCount = retryCount
      const updateRequest = store.put(action)

      updateRequest.onsuccess = () => resolve()
      updateRequest.onerror = () => reject(new Error("Failed to update"))
    }

    getRequest.onerror = () => {
      reject(new Error("Failed to get action"))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}
