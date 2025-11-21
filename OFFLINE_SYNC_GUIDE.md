# 📱 Guía Completa: Offline Sync en MantenIX Mobile

## 🎯 ¿Cómo Funciona el Offline Mode?

### Flujo Completo con Ejemplo Real

Imagina que un técnico está trabajando en una orden de trabajo sin internet:

---

### **PASO 1: Usuario hace una acción (sin internet)**

```typescript
// El técnico completa una orden de trabajo
// Frontend: src/app/mobile/work-orders/[id]/page.tsx

const handleComplete = async () => {
  const response = await fetch('/api/work-orders/abc123/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      completionNotes: 'Reparación completada',
      actualCost: 5000
    })
  })

  const data = await response.json()
  console.log(data) // Ver qué responde
}
```

---

### **PASO 2: Service Worker intercepta el request**

```typescript
// Service Worker: src/app/sw.ts (línea 152-220)

self.addEventListener("fetch", (event) => {
  const { request } = event

  // ✅ Detecta que es POST y a /api/
  if (request.method === "POST" && request.url.includes("/api/")) {

    event.respondWith(
      // Intenta hacer el fetch normal
      fetch(request.clone())
        .catch(async () => {
          // ❌ Falla porque no hay internet
          // 📦 GUARDA EN INDEXEDDB

          const body = await request.clone().text()
          const headers = {}
          request.headers.forEach((v, k) => { headers[k] = v })

          await addOfflineAction({
            url: '/api/work-orders/abc123/complete',
            method: 'POST',
            headers: headers,
            body: body,
            timestamp: Date.now(),
            retryCount: 0
          })

          // ✅ Retorna respuesta "queued"
          return new Response(JSON.stringify({
            success: true,
            queued: true,
            message: "Acción guardada. Se sincronizará cuando vuelva la conexión."
          }), {
            status: 202, // Accepted
            headers: { 'Content-Type': 'application/json' }
          })
        })
    )
  }
})
```

---

### **PASO 3: Frontend recibe respuesta 202**

```typescript
// Usuario recibe confirmación inmediata
const response = await fetch('/api/work-orders/abc123/complete', {...})

console.log(response.status) // 202 (Accepted, no 200)
console.log(await response.json())
// {
//   success: true,
//   queued: true,
//   message: "Acción guardada. Se sincronizará cuando vuelva la conexión."
// }

// Puedes mostrar un toast:
toast.info("Acción guardada. Se enviará cuando tengas internet.")
```

---

### **PASO 4: OfflineIndicator muestra el estado**

```typescript
// Component: src/components/pwa/offline-indicator.tsx

// Banner aparece en la parte inferior:
// 📶❌ Sin conexión - Trabajando offline  🕐 1
//                                        👆 1 acción pendiente
```

---

### **PASO 5: IndexedDB tiene la acción guardada**

Puedes ver esto en Chrome DevTools:

```
Chrome DevTools → Application tab → Storage → IndexedDB
  └── mantenix-offline-db
      └── offline-actions
          └── Action 1
              ├── id: 1
              ├── url: "/api/work-orders/abc123/complete"
              ├── method: "POST"
              ├── headers: { "content-type": "application/json" }
              ├── body: '{"completionNotes":"Reparación completada"}'
              ├── timestamp: 1731963845000
              └── retryCount: 0
```

**IndexedDB es como una mini base de datos en el navegador:**
- ✅ Los datos NO se pierden al cerrar el navegador
- ✅ Funciona 100% offline
- ✅ Puede guardar MB de datos
- ✅ Es más robusto que localStorage

---

### **PASO 6: Usuario recupera internet**

```typescript
// Hook: src/hooks/use-network-status.ts

const handleOnline = useCallback(() => {
  console.log("[PWA] Back online!")
  setIsOnline(true)

  // 🚀 REGISTRA BACKGROUND SYNC
  if (registration && "sync" in registration) {
    registration.sync.register("sync-offline-actions")
      .then(() => {
        console.log("[PWA] Background sync registered")
      })
  }
}, [registration])

// Este evento se dispara automáticamente cuando el navegador
// detecta que hay internet de nuevo
window.addEventListener("online", handleOnline)
```

---

### **PASO 7: Background Sync Event se dispara**

```typescript
// Service Worker: src/app/sw.ts (línea 239-321)

self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event triggered:", event.tag)

  if (event.tag === "sync-offline-actions") {
    // 🔄 PROCESA LA COLA
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  // 1. Lee todas las acciones de IndexedDB
  const actions = await getAllOfflineActions()

  console.log(`[SW] Syncing ${actions.length} offline actions`)
  // → "[SW] Syncing 1 offline actions"

  // 2. Procesa cada acción
  for (const action of actions) {
    await processOfflineAction(action, MAX_RETRIES)
  }
}
```

---

### **PASO 8: Se envía el request al servidor**

```typescript
async function processOfflineAction(action, maxRetries) {
  const { id, url, method, headers, body, retryCount } = action

  console.log(`[SW] Processing action ${id}: ${method} ${url}`)
  // → "[SW] Processing action 1: POST /api/work-orders/abc123/complete"

  try {
    // 🌐 EJECUTA EL REQUEST REAL
    const response = await fetch(url, {
      method,   // POST
      headers,  // { "content-type": "application/json" }
      body      // '{"completionNotes":"..."}'
    })

    if (response.ok) {
      // ✅ ÉXITO - Elimina de IndexedDB
      console.log(`[SW] Action ${id} synced successfully`)
      await deleteOfflineAction(id)

      // La orden ahora está completada en el servidor ✅
      // El técnico puede refrescar y ver el estado actualizado

    } else {
      // ⚠️ Error del servidor (400, 500, etc.)
      console.error(`[SW] Action ${id} failed with status:`, response.status)
      await updateRetryCount(id, retryCount + 1)
      // Se intentará de nuevo en el próximo sync
    }

  } catch (error) {
    // ❌ Error de red (aún sin internet estable)
    console.error(`[SW] Network error processing action ${id}`)
    await updateRetryCount(id, retryCount + 1)

    // Si retryCount >= 3, se descarta la acción
    if (retryCount >= 3) {
      console.error(`[SW] Max retries exceeded, removing action ${id}`)
      await deleteOfflineAction(id)
    }
  }
}
```

---

### **PASO 9: IndexedDB se limpia**

```typescript
// Después del sync exitoso:
console.log("[SW] Sync completed")

// IndexedDB ahora está vacía
// Chrome DevTools → IndexedDB → offline-actions: 0 items

// OfflineIndicator se actualiza:
// Banner desaparece (ya hay internet)
// O muestra: 🕐 0 (sin acciones pendientes)
```

---

## 🔄 Diagrama de Flujo Simplificado

```
┌─────────────────────────────────────┐
│  👤 Usuario sin internet            │
│  Completa orden de trabajo          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  📡 fetch() → Service Worker        │
│  Intenta enviar al servidor         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  ❌ Falla (offline)                 │
│  .catch() ejecuta                   │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  💾 Guarda en IndexedDB             │
│  - url, method, headers, body       │
│  - timestamp, retryCount            │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  ✅ Retorna 202 Accepted            │
│  Usuario ve: "Acción guardada..."   │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🕐 Usuario ve contador             │
│  Banner: "Sin conexión 🕐 1"        │
└─────────────────────────────────────┘
                ↓
          ... tiempo ...
                ↓
┌─────────────────────────────────────┐
│  📶 Vuelve internet                 │
│  window.addEventListener("online")  │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🚀 Background Sync                 │
│  registration.sync.register(...)    │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🔄 Service Worker procesa cola     │
│  Lee IndexedDB, hace fetch()        │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🌐 Envía al servidor               │
│  POST /api/work-orders/abc123/...   │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  ✅ Servidor responde OK            │
│  Orden completada en BD             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🧹 Limpia IndexedDB                │
│  Elimina acción procesada           │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  🎉 Sincronización completa         │
│  Usuario puede refrescar y ver      │
│  los cambios en la aplicación       │
└─────────────────────────────────────┘
```

---

## 🧪 Cómo Probar (Testing)

### Opción 1: Chrome DevTools (Más fácil)

1. **Build de producción:**
   ```bash
   npm run build
   npm start
   ```

2. **Abrir en Chrome:**
   ```
   http://localhost:3000/mobile/work-orders
   ```

3. **Abrir DevTools (F12):**
   - Tab **Application** → Service Workers
   - Verificar que está "activated and running"

4. **Simular offline:**
   - Tab **Network** → Throttling → **Offline**

5. **Hacer una acción:**
   - Completar una orden
   - Agregar un comentario
   - Cualquier POST/PUT/PATCH

6. **Ver IndexedDB:**
   - Tab **Application** → Storage → IndexedDB
   - `mantenix-offline-db` → `offline-actions`
   - Debe aparecer 1 registro con tu acción

7. **Ver el banner:**
   - Debe mostrar: "Sin conexión - Trabajando offline 🕐 1"

8. **Volver online:**
   - Network → Throttling → **No throttling**

9. **Ver console:**
   ```
   [SW] Sync event triggered: sync-offline-actions
   [SW] Syncing 1 offline actions
   [SW] Processing action 1: POST /api/work-orders/abc123/complete
   [SW] Action 1 synced successfully
   [SW] Sync completed
   ```

10. **Verificar IndexedDB:**
    - Ahora debe estar vacía (0 items)

11. **Verificar en la app:**
    - Refrescar la página
    - La orden debe estar completada ✅

---

### Opción 2: Desconectar WiFi Real

1. Build de producción (igual que antes)

2. Abrir en el móvil:
   ```
   http://[tu-ip-local]:3000/mobile
   ```

3. **Desconectar WiFi del teléfono**

4. Hacer acciones en la app

5. Ver banner offline con contador

6. **Reconectar WiFi**

7. Las acciones se sincronizan automáticamente

---

## 📊 Arquitectura de Archivos

```
src/
├── app/
│   ├── sw.ts                    # 🔧 Service Worker
│   └── mobile/
│       └── layout.tsx           # 🔌 Integra PWAProvider
│
├── lib/
│   └── sw-db.ts                 # 💾 IndexedDB utilities
│
├── hooks/
│   ├── use-service-worker.ts   # 📡 SW registration
│   ├── use-network-status.ts   # 🌐 Online/offline
│   └── use-offline-queue.ts    # 📊 Queue monitoring
│
└── components/
    └── pwa/
        ├── pwa-provider.tsx     # 🎛️ Orchestrator
        └── offline-indicator.tsx # 📱 UI Banner
```

---

## 🎯 Qué Acciones se Guardan Offline

**Se guardan automáticamente:**
- ✅ POST requests a /api/*
- ✅ PUT requests a /api/*
- ✅ PATCH requests a /api/*

**NO se guardan:**
- ❌ GET requests (se cachean con Serwist)
- ❌ DELETE requests (por seguridad)

**Ejemplos que funcionan offline:**
- Completar orden de trabajo
- Agregar comentarios
- Actualizar status
- Crear nueva orden
- Subir fotos (si el body es small)
- Marcar asistencia
- Crear alertas

---

## ⚙️ Configuración Avanzada

### Cambiar máximo de reintentos

```typescript
// src/app/sw.ts (línea 251)
const MAX_RETRIES = 3  // Cambiar a 5, 10, etc.
```

### Cambiar intervalo de chequeo de cola

```typescript
// src/hooks/use-offline-queue.ts
const { pendingCount } = useOfflineQueue(10000) // 10 segundos en vez de 5
```

### Agregar más endpoints a la caché

```typescript
// src/app/sw.ts (línea 58-67)
{
  matcher: ({ url }) => {
    return (
      url.pathname.startsWith("/api/") &&
      (
        url.pathname.includes("/work-orders") ||
        url.pathname.includes("/alerts") ||
        url.pathname.includes("/attendance") ||
        url.pathname.includes("/assets") ||
        url.pathname.includes("/inventory")  // ← Agregar nuevo
      )
    );
  },
  // ...
}
```

---

## 🐛 Troubleshooting

### "Service Worker no se registra"

**Causa:** Solo funciona en producción

**Solución:**
```bash
npm run build
npm start
# NO: npm run dev
```

---

### "IndexedDB está vacía pero debería tener acciones"

**Causa:** El fetch no está fallando (hay internet)

**Solución:**
- Chrome DevTools → Network → Offline
- O desconectar WiFi real

---

### "Las acciones no se sincronizan"

**Causa:** Background Sync API no disponible

**Solución:**
- Chrome/Edge: ✅ Soportado
- Safari: ❌ No soportado (usar fallback)
- Firefox: ⚠️ Soporte parcial

**Fallback manual:**
```typescript
// Si background sync no está disponible
if (!("sync" in registration)) {
  // Polling manual cada 30 segundos
  setInterval(async () => {
    if (navigator.onLine) {
      await syncOfflineActions()
    }
  }, 30000)
}
```

---

## 🚀 Mejoras Futuras (Opcional)

### 1. **UI para ver la cola**

```typescript
// Componente para mostrar acciones pendientes
<OfflineQueueList />
  - Ver todas las acciones en espera
  - Cancelar acciones individuales
  - Ver detalles de cada request
```

### 2. **Caché de datos READ**

```typescript
// Cachear GET requests para consultar offline
- Ver órdenes de trabajo sin internet
- Ver inventario
- Ver activos
```

### 3. **Notificaciones**

```typescript
// Notificar cuando sync completa
await self.registration.showNotification("Sincronización completa", {
  body: "3 acciones enviadas al servidor"
})
```

### 4. **Estrategia de conflictos**

```typescript
// Si otro usuario modificó la misma orden
- Detectar conflictos
- Mostrar UI para resolverlos
- Merge strategies
```

---

## ✅ Checklist de Implementación

- [x] Service Worker configurado
- [x] IndexedDB utilities
- [x] Offline queue en fetch handler
- [x] Background Sync event handler
- [x] Hooks de React (3)
- [x] OfflineIndicator con contador
- [x] PWAProvider integrado en /mobile
- [x] Build exitoso
- [ ] Testing en Chrome DevTools (pendiente por usuario)
- [ ] Testing en dispositivo real (pendiente por usuario)
- [ ] Deploy a producción (pendiente)

---

## 📚 Referencias

- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Serwist Documentation](https://serwist.pages.dev/)
- [PWA Best Practices](https://web.dev/pwa/)

---

**Implementado por:** Claude Code con Next.js Expert standards ✨
**Fecha:** Noviembre 2024
**Versión:** 1.0.0
