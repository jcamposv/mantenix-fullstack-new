# HR/Attendance Module - Implementation Summary

## ✅ Completed Backend Implementation

### 1. Database Schema (Prisma)
- **Nuevos Enums**:
  - `FeatureModule`: HR_ATTENDANCE, HR_VACATIONS, HR_PERMISSIONS, AI_ASSISTANT, ADVANCED_ANALYTICS
  - `AttendanceStatus`: ON_TIME, LATE, ABSENT, JUSTIFIED, EARLY_DEPARTURE

- **Nuevas Tablas**:
  - `CompanyFeature`: Sistema de features premium por empresa
  - `CompanyLocation`: Ubicaciones con geofencing para marcaje
  - `AttendanceRecord`: Registros de asistencia con geolocalización

- **Migración**: ✅ Aplicada (`20251101124122_add_hr_attendance_module`)

### 2. TypeScript Types
- **`src/types/attendance.types.ts`**: Tipos completos para attendance, locations, reportes
- **`src/types/feature.types.ts`**: Tipos para sistema de features

### 3. Utilities
- **`src/lib/geolocation.ts`**: Utilidades con arrow functions
  - `calculateDistance()`: Cálculo de distancia Haversine
  - `validateGeofence()`: Validación de geofencing
  - `requestGeolocation()`: Solicitud de GPS del navegador
  - `formatDistance()`: Formato de distancias

### 4. Repositories (Prisma Data Access)
- **`src/server/repositories/feature.repository.ts`**: CRUD de features
- **`src/server/repositories/attendance.repository.ts`**: CRUD + estadísticas de asistencia
- **`src/server/repositories/location.repository.ts`**: CRUD de ubicaciones

### 5. Services (Business Logic)
- **`src/server/services/feature.service.ts`**:
  - `toggleFeature()`: Habilitar/deshabilitar módulos
  - `isModuleEnabled()`: Verificar si un módulo está habilitado
  - `requireModuleEnabled()`: Throw error si no está habilitado

- **`src/server/services/attendance.service.ts`**:
  - `checkIn()`: Marcar entrada con validación de geofencing
  - `checkOut()`: Marcar salida con cálculo de horas
  - `getTodayRecord()`: Obtener registro del día actual
  - `getMonthlyReport()`: Reporte mensual por usuario
  - `getDailySummary()`: Resumen diario de la empresa

- **`src/server/services/location.service.ts`**:
  - CRUD completo de ubicaciones con permisos

### 6. Permission System
- **`src/server/helpers/permission.helper.ts`**: Actualizado con nuevos permisos
  - `MANAGE_FEATURES`: Solo SUPER_ADMIN
  - `VIEW_ATTENDANCE`, `CREATE_ATTENDANCE`: Todos los roles internos
  - `VIEW_ALL_ATTENDANCE`: SUPER_ADMIN
  - `VIEW_COMPANY_ATTENDANCE`: ADMIN_EMPRESA, SUPERVISOR
  - `MANAGE_LOCATIONS`: SUPER_ADMIN, ADMIN_EMPRESA

### 7. Zod Schemas (Validation)
- **`src/app/api/schemas/attendance-schemas.ts`**:
  - `checkInSchema`: Validación de check-in
  - `checkOutSchema`: Validación de check-out
  - `attendanceFiltersSchema`: Filtros para búsquedas
  - `createLocationSchema`: Crear ubicaciones
  - `toggleFeatureSchema`: Toggle de features
  - Y más...

### 8. API Routes
- **Attendance**:
  - `POST /api/attendance/check-in`: Marcar entrada
  - `POST /api/attendance/check-out`: Marcar salida
  - `GET /api/attendance/today`: Obtener registro de hoy
  - `GET /api/attendance`: Listar registros con filtros

- **Features**:
  - `POST /api/admin/features/toggle`: Habilitar/deshabilitar módulo
  - `GET /api/admin/features/[companyId]`: Obtener features de empresa

### 9. Server Exports
- **`src/server/index.ts`**: Actualizado con exports de nuevos servicios y repositorios

---

## 🚧 Pending Frontend Implementation

### 1. Mobile App (`/mobile/attendance`)

#### **Componentes a crear**:

**`src/app/mobile/attendance/page.tsx`** - Vista principal de asistencia
```tsx
- Mostrar registro de hoy si existe (con hora entrada/salida)
- Botón "Marcar Entrada" (si no ha marcado)
- Botón "Marcar Salida" (si ya marcó entrada)
- Usar hook useAttendance()
- Mostrar skeleton mientras carga
- Validar GPS antes de permitir marcaje
```

**`src/components/mobile/attendance/attendance-card.tsx`** - Card de asistencia
```tsx
- Mostrar estado actual (ON_TIME, LATE, etc.)
- Hora de entrada y salida
- Duración trabajada
- Botones de acción
- Indicador de ubicación
- Badge de estado con colores
```

**`src/components/mobile/attendance/location-permission.tsx`** - Solicitud de permisos
```tsx
- Solicitar permiso de ubicación
- Mostrar estado de GPS
- Indicador de distancia a la oficina
- Mensaje de error si está fuera del rango
```

**`src/hooks/useAttendance.ts`** - Hook principal
```tsx
import { useState, useEffect } from 'react'
import { requestGeolocation } from '@/lib/geolocation'

export const useAttendance = () => {
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)

  const checkIn = async () => {
    const coords = await requestGeolocation()
    // POST /api/attendance/check-in
  }

  const checkOut = async () => {
    const coords = await requestGeolocation()
    // POST /api/attendance/check-out
  }

  return { todayRecord, loading, checkIn, checkOut, location }
}
```

#### **Layout mobile**:
- Agregar link a `/mobile/attendance` en `mobile-nav.tsx`
- Icono: `Clock` o `CalendarCheck` de lucide-react

---

### 2. Dashboard Admin (`/admin/attendance`)

#### **Vista de reportes**:

**`src/app/(dashboard)/admin/attendance/page.tsx`** - Lista de asistencia
```tsx
- Tabla con filtros: usuario, fecha, estado
- Paginación
- Export a Excel
- Resumen diario en cards superiores
```

**`src/app/(dashboard)/admin/attendance/reports/[userId]/page.tsx`** - Reporte por usuario
```tsx
- Selector de mes/año
- Gráfico de asistencia mensual
- Tabla de registros del mes
- Estadísticas: días a tiempo, tarde, ausente
- Total horas trabajadas
```

**`src/app/(dashboard)/admin/locations/page.tsx`** - Gestión de ubicaciones
```tsx
- Tabla de ubicaciones
- CRUD: Crear, editar, desactivar
- Mapa con marcadores (opcional, usar Leaflet o Mapbox)
- Radio de geofencing configurable
```

---

### 3. Super Admin Features (`/super-admin/features`)

**`src/app/(dashboard)/super-admin/features/page.tsx`** - Gestión de features
```tsx
- Lista de todas las empresas
- Por cada empresa, toggles para cada feature module:
  - ✅ HR_ATTENDANCE
  - ❌ HR_VACATIONS (disabled)
  - ❌ HR_PERMISSIONS (disabled)
  - ❌ AI_ASSISTANT (disabled)
  - ❌ ADVANCED_ANALYTICS (disabled)
- Usar Switch de shadcn/ui
- Toast de confirmación al cambiar
```

**Ejemplo de código**:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function FeaturesPage() {
  const [companies, setCompanies] = useState([])

  const toggleFeature = async (companyId, module, isEnabled) => {
    const res = await fetch('/api/admin/features/toggle', {
      method: 'POST',
      body: JSON.stringify({ companyId, module, isEnabled })
    })

    if (res.ok) {
      toast.success('Feature actualizado')
    }
  }

  return (
    <div>
      {companies.map(company => (
        <Card key={company.id}>
          <h3>{company.name}</h3>
          <div>
            <Switch
              checked={company.features?.HR_ATTENDANCE}
              onCheckedChange={(checked) =>
                toggleFeature(company.id, 'HR_ATTENDANCE', checked)
              }
            />
            Asistencia y Marcaje
          </div>
          {/* Más features... */}
        </Card>
      ))}
    </div>
  )
}
```

---

## 📝 Notas Importantes

### Seguridad
- ✅ Todas las rutas verifican autenticación con `AuthService.getAuthenticatedSession()`
- ✅ Permisos granulares por rol usando `PermissionHelper`
- ✅ Feature flags validados en backend antes de operaciones

### Geofencing
- Radio predeterminado: 100m (configurable por ubicación)
- Precisión GPS requerida: Alta (`enableHighAccuracy: true`)
- Timeout: 10 segundos
- Fórmula Haversine para cálculo de distancias

### Estados de Asistencia
- `ON_TIME`: Llegó antes de las 8:00 AM (configurable)
- `LATE`: Llegó después de las 8:00 AM
- `ABSENT`: No marcó entrada
- `JUSTIFIED`: Ausencia justificada
- `EARLY_DEPARTURE`: Salió antes de tiempo (futuro)

### Configuración Futura
- Hora de inicio trabajo: Actualmente hardcodeado a 8:00 AM
- Debería ser configurable por empresa en `Company` model
- Agregar campos: `workStartHour`, `workStartMinute`, `workEndHour`, `workEndMinute`

---

## 🎨 UI Components Recomendados

### Mobile (shadcn/ui):
- `Card`: Para contenedor de asistencia
- `Button`: Acciones de check-in/out
- `Badge`: Estados de asistencia
- `Alert`: Mensajes de error/éxito
- `Skeleton`: Loading states

### Dashboard:
- `DataTable`: Tabla de registros
- `DatePicker`: Filtros de fecha
- `Select`: Filtros de usuario/estado
- `Chart` (Recharts): Gráficos de asistencia
- `Switch`: Toggle de features

### Colores sugeridos:
```tsx
const statusColors = {
  ON_TIME: "bg-green-500",
  LATE: "bg-yellow-500",
  ABSENT: "bg-red-500",
  JUSTIFIED: "bg-blue-500",
  EARLY_DEPARTURE: "bg-orange-500"
}
```

---

## 🚀 Next Steps

1. **Implementar vista móvil de marcaje** (más urgente para usuarios)
2. **Crear gestión de ubicaciones** (necesario para que funcione el geofencing)
3. **Habilitar feature para empresa de prueba** (desde super admin)
4. **Implementar reportes de admin**
5. **Testing end-to-end del flujo completo**

---

## 📦 Dependencies Ya Instaladas

Todo lo necesario ya está en el proyecto:
- ✅ Prisma
- ✅ Zod
- ✅ shadcn/ui
- ✅ Tailwind CSS
- ✅ Lucide Icons
- ✅ React Hook Form
- ✅ Sonner (toasts)

No se necesita instalar nada adicional para el módulo de asistencia básico.

---

**Implementación completada**: Backend 100%
**Pendiente**: Frontend (mobile app + dashboard)
