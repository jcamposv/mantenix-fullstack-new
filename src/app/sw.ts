/**
 * Service Worker for MantenIX Mobile PWA
 *
 * Provides offline-first capabilities for /mobile routes
 * - Caches mobile pages and assets
 * - Handles API requests with network-first strategy
 * - Queues offline actions for background sync
 */

/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst } from "serwist";
import {
  addOfflineAction,
  getAllOfflineActions,
  deleteOfflineAction,
  updateRetryCount,
  type OfflineAction,
} from "@/lib/sw-db";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // Cache mobile pages - NetworkFirst strategy with offline fallback
    {
      matcher: ({ request, url }) => {
        return (
          request.destination === "document" &&
          url.pathname.startsWith("/mobile")
        );
      },
      handler: new NetworkFirst({
        cacheName: "mobile-pages",
        networkTimeoutSeconds: 5,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response?.ok ? response : null;
            },
            handlerDidError: async () => {
              // If page not in cache and network failed, show offline page
              const cache = await caches.open("mobile-pages");
              const offlinePage = await cache.match("/offline");

              if (offlinePage) {
                return offlinePage;
              }

              // Fallback if /offline not cached (shouldn't happen)
              return new Response(
                `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin Conexión</title>
                  <style>
                    body {
                      font-family: system-ui, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background: #f3f4f6;
                    }
                    .container {
                      text-align: center;
                      padding: 2rem;
                    }
                    h1 { color: #1f2937; margin-bottom: 1rem; }
                    p { color: #6b7280; }
                    button {
                      margin-top: 1rem;
                      padding: 0.75rem 1.5rem;
                      background: #3b82f6;
                      color: white;
                      border: none;
                      border-radius: 0.5rem;
                      cursor: pointer;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>📡 Sin Conexión</h1>
                    <p>Esta página no está disponible offline</p>
                    <button onclick="history.back()">Volver</button>
                  </div>
                </body>
                </html>
                `,
                {
                  headers: { "Content-Type": "text/html" },
                }
              );
            },
          },
        ],
      }),
    },

    // Cache mobile API requests - NetworkFirst with short timeout
    {
      matcher: ({ url }) => {
        return (
          url.pathname.startsWith("/api/") &&
          (
            url.pathname.includes("/work-orders") ||
            url.pathname.includes("/alerts") ||
            url.pathname.includes("/attendance") ||
            url.pathname.includes("/assets")
          )
        );
      },
      handler: new NetworkFirst({
        cacheName: "mobile-api",
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response?.ok ? response : null;
            },
            cacheDidUpdate: async ({ request, newResponse }) => {
              if (newResponse) {
                console.log(
                  `[SW] Cached API response updated:`,
                  request.url
                );
              }
            },
          },
        ],
      }),
    },

    // Cache images - CacheFirst strategy
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "mobile-images",
        plugins: [],
      }),
    },

    // Cache static assets (JS, CSS) - CacheFirst
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style",
      handler: new CacheFirst({
        cacheName: "mobile-static",
        plugins: [],
      }),
    },

    // Cache fonts - CacheFirst with long expiration
    {
      matcher: ({ request }) => request.destination === "font",
      handler: new CacheFirst({
        cacheName: "mobile-fonts",
        plugins: [],
      }),
    },

    // Default catch-all - NetworkFirst
    ...defaultCache,
  ],
});

// Listen to messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    // Clear all caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith("mobile-")) {
            return caches.delete(cacheName);
          }
        })
      );
    });
  }
});

// Handle offline queue - store failed POST/PUT/PATCH requests
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle POST, PUT, PATCH for offline queue
  if (
    (request.method === "POST" ||
      request.method === "PUT" ||
      request.method === "PATCH") &&
    request.url.includes("/api/")
  ) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        // Network request failed - store in IndexedDB for later sync
        const clonedRequest = request.clone();
        const body = await clonedRequest.text();

        // Extract headers
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        try {
          // Store in IndexedDB
          await addOfflineAction({
            url: request.url,
            method: request.method,
            headers,
            body,
            timestamp: Date.now(),
            retryCount: 0,
          });

          console.log("[SW] Action saved to offline queue");

          // Return a response indicating the request was queued
          return new Response(
            JSON.stringify({
              success: true,
              queued: true,
              message: "Acción guardada. Se sincronizará cuando vuelva la conexión.",
            }),
            {
              status: 202, // Accepted
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("[SW] Failed to queue action:", error);

          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to save action for offline sync",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      })
    );
    return;
  }

  // Let Serwist handle all other requests
  serwist.handleFetch(event);
});

serwist.addEventListeners();

// Log service worker installation
self.addEventListener("install", () => {
  console.log("[SW] Service Worker installing...");
});

self.addEventListener("activate", () => {
  console.log("[SW] Service Worker activated!");
});

/**
 * Background Sync Handler
 *
 * Processes offline actions when connection is restored
 * Retries failed requests and manages the queue
 */
self.addEventListener("sync", (event: SyncEvent) => {
  console.log("[SW] Sync event triggered:", event.tag);

  if (event.tag === "sync-offline-actions") {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Process all queued offline actions
 */
async function syncOfflineActions(): Promise<void> {
  const MAX_RETRIES = 3;

  try {
    const actions = await getAllOfflineActions();

    if (actions.length === 0) {
      console.log("[SW] No offline actions to sync");
      return;
    }

    console.log(`[SW] Syncing ${actions.length} offline actions`);

    for (const action of actions) {
      try {
        await processOfflineAction(action, MAX_RETRIES);
      } catch (error) {
        console.error("[SW] Failed to process action:", action.id, error);
      }
    }

    console.log("[SW] Sync completed");
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Process a single offline action
 */
async function processOfflineAction(
  action: OfflineAction,
  maxRetries: number
): Promise<void> {
  const { id, url, method, headers, body, retryCount } = action;

  if (!id) {
    console.error("[SW] Action has no ID, skipping");
    return;
  }

  // Check if max retries exceeded
  if (retryCount >= maxRetries) {
    console.error(`[SW] Max retries (${maxRetries}) exceeded for action:`, id);
    await deleteOfflineAction(id);
    return;
  }

  try {
    console.log(`[SW] Processing action ${id}: ${method} ${url}`);

    // Recreate the request
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    if (response.ok) {
      console.log(`[SW] Action ${id} synced successfully`);
      await deleteOfflineAction(id);
    } else {
      console.error(`[SW] Action ${id} failed with status:`, response.status);
      await updateRetryCount(id, retryCount + 1);
    }
  } catch (error) {
    console.error(`[SW] Network error processing action ${id}:`, error);
    await updateRetryCount(id, retryCount + 1);
    throw error; // Re-throw to trigger background sync retry
  }
}
