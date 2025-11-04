# Dashboard Components Structure

Esta carpeta contiene todos los componentes del dashboard organizados por rol para mejor escalabilidad y reutilización.

## 📁 Estructura

```
dashboard/
├── company/              # Empresa proveedora (MantenIX)
├── client/               # Cliente (empresa que contrata el servicio)
├── super-admin/          # Super administrador de plataforma
└── shared/               # Componentes compartidos entre roles
```

## 🏢 Company (Empresa Proveedora)

**Rol**: ADMIN, MANAGER
**Descripción**: Empresa que provee el servicio de mantenimiento (MantenIX)

### Componentes:
- `work-orders-dashboard.tsx` - Dashboard principal de órdenes
- `work-orders-overview.tsx` - KPIs de órdenes de trabajo
- `maintenance-metrics.tsx` - Métricas de ingeniería industrial (MTTR, SLA, etc.)
- `status-distribution-chart.tsx` - Gráfica de distribución por estado
- `performance-metrics.tsx` - Métricas de rendimiento del equipo

### Vista:
- `/work-orders` - Dashboard de órdenes de trabajo
- `/` - Dashboard principal

---

## 👥 Client (Empresa Cliente)

**Rol**: CLIENT_COMPANY_ADMIN
**Descripción**: Jefes de mantenimiento e ingenieros industriales de la empresa que CONTRATA el servicio

### Componentes:
- `work-order-stats.tsx` - Estadísticas básicas de órdenes
- *(Por agregar)* `provider-performance.tsx` - Rendimiento del proveedor
- *(Por agregar)* `critical-orders.tsx` - Órdenes críticas y vencidas
- *(Por agregar)* `site-metrics.tsx` - Métricas por sede

### Vista:
- `/client/work-orders` - Dashboard de órdenes para cliente

### Necesidades del Cliente:
- 📊 Rendimiento del proveedor (SLA, tiempos de respuesta)
- 🚨 Órdenes críticas (vencidas, urgentes)
- 🏭 Análisis por sede/sitio
- 📈 Tendencias temporales
- 📅 Próximos mantenimientos preventivos
- 💰 Costos (si aplica)

---

## 👑 Super Admin (Administrador de Plataforma)

**Rol**: SUPER_ADMIN
**Descripción**: Administrador de toda la plataforma MantenIX

### Componentes:
- *(Por crear)* `platform-stats.tsx` - Estadísticas de toda la plataforma
- *(Por crear)* `companies-overview.tsx` - Vista de todas las empresas
- *(Por crear)* `system-metrics.tsx` - Métricas del sistema

### Vista:
- `/super-admin` - Dashboard de super administrador

---

## 🔄 Shared (Componentes Compartidos)

Componentes reutilizables por todos los roles.

### Componentes:
- `dashboard-filters.tsx` - Filtros de fecha y período
- `dashboard-loading.tsx` - Estado de carga
- `dashboard-error.tsx` - Estado de error
- `dashboard-empty.tsx` - Estado vacío
- `recent-activity.tsx` - Actividad reciente
- `kpi-card.tsx` - Card de KPI genérico
- `upcoming-work-orders.tsx` - Próximas órdenes

---

## 🎨 Estándares de Diseño

### Colores Semánticos:
- `success` - Verde para completado/exitoso
- `info` - Azul para en progreso/información
- `warning` - Ámbar para pendiente/advertencia
- `destructive` - Rojo para vencido/error
- `primary` - Gris para principal/neutral

### Cards:
- Todos los Cards deben tener `className="shadow-none"`
- Usar variables CSS: `bg-success/5`, `border-success/20`, etc.
- No usar colores hardcoded (green-500, blue-600, etc.)

### Tipografía:
- Títulos: `text-2xl font-bold tracking-tight`
- Subtítulos: `text-sm text-muted-foreground`
- KPIs: `text-2xl font-bold`

---

## 📝 Guía de Uso

### Crear componente para nuevo rol:

1. **Crear carpeta** si no existe:
   ```bash
   mkdir src/components/dashboard/[rol]
   ```

2. **Crear componente**:
   ```tsx
   // src/components/dashboard/[rol]/my-component.tsx
   import { Card } from "@/components/ui/card"

   export function MyComponent() {
     return (
       <Card className="shadow-none">
         {/* contenido */}
       </Card>
     )
   }
   ```

3. **Usar componentes compartidos**:
   ```tsx
   import { DashboardFilters } from "../shared/dashboard-filters"
   import { KPICard } from "../shared/kpi-card"
   ```

4. **Importar en página**:
   ```tsx
   import { MyComponent } from "@/components/dashboard/[rol]/my-component"
   ```

---

## 🔄 Reutilización

### Reglas:
1. ✅ Los componentes en `shared/` pueden ser usados por cualquier rol
2. ✅ Los componentes de un rol pueden importar de `shared/`
3. ❌ Los componentes de un rol NO deben importar de otro rol
4. ✅ Si un componente se repite entre roles, moverlo a `shared/`

---

## 📚 Referencias

- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- Variables CSS del proyecto: `src/app/globals.css`
