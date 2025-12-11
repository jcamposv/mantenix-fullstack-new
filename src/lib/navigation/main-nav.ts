/**
 * Main Navigation Configuration
 *
 * Operational workflow order for maintenance management:
 * 1. Dashboard → Overview & KPIs
 * 2. Assets → Asset registry & hierarchy
 * 3. Work Orders → Execution & tracking
 * 4. Preventive Maintenance → Planning (feature flag)
 * 5. Inventory → Spare parts management
 * 6. Alerts → Reactive & predictive notifications
 * 7. Production Lines → Manufacturing context
 *
 * Following Next.js Expert standards
 */

import {
  SquareTerminal,
  Package2,
  ClipboardList,
  Wrench,
  Package,
  Bell,
  Factory,
  BarChart3,
  ShieldAlert,
  Target,
} from 'lucide-react'
import type { NavigationItem } from './types'

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  // 1. Dashboard - Entry point for all users
  {
    title: 'Home',
    url: '/',
    icon: SquareTerminal,
    isActive: true,
  },

  // 2. Assets - Foundation of maintenance management
  {
    title: 'Activos',
    url: '/admin/assets',
    icon: Package2,
    permission: 'assets.view',
    items: [
      {
        title: 'Lista de Activos',
        url: '/admin/assets',
        permission: 'assets.view',
      },
      {
        title: 'Nuevo Activo',
        url: '/admin/assets/new',
        permission: 'assets.create',
      },
      {
        title: 'Componentes',
        url: '/admin/exploded-view-components',
        permission: 'assets.view',
      },
    ],
  },

  // 3. Work Orders - Core operational workflow
  {
    title: 'Órdenes de Trabajo',
    url: '/work-orders',
    icon: ClipboardList,
    items: [
      {
        title: 'Dashboard',
        url: '/work-orders',
      },
      {
        title: 'Lista de Órdenes',
        url: '/work-orders/list',
      },
      {
        title: 'Mis Órdenes',
        url: '/work-orders/my',
        permission: 'work_orders.view_assigned',
      },
      {
        title: 'Crear Orden',
        url: '/work-orders/new/select-template',
        permission: 'work_orders.create',
      },
    ],
  },

  // 4. Preventive Maintenance - Proactive planning (feature flag)
  // This section is conditionally added via getFeatureNavItems
  // See: hasPredictiveMaintenance feature flag

  // 5. Inventory - Spare parts & materials
  {
    title: 'Inventario',
    url: '/admin/inventory',
    icon: Package,
    permission: 'inventory.view',
    items: [
      {
        title: 'Lista de Items',
        url: '/admin/inventory',
        permission: 'inventory.view',
      },
      {
        title: 'Solicitudes',
        url: '/admin/inventory/requests',
        permission: 'inventory.request',
      },
      {
        title: 'Movimientos',
        url: '/admin/inventory/movements',
        permission: 'inventory.view_movements',
      },
    ],
  },

  // 6. Alerts - Reactive & predictive notifications
  {
    title: 'Alertas',
    url: '/alerts',
    icon: Bell,
    badge: true,
    items: [
      {
        title: 'Todas las Alertas',
        url: '/alerts',
      },
      {
        title: 'Mis Alertas',
        url: '/alerts/my',
      },
      {
        title: 'Críticas',
        url: '/alerts/critical',
      },
    ],
  },

  // 7. Production Lines - Manufacturing context
  {
    title: 'Líneas de Producción',
    url: '/production-lines',
    icon: Factory,
    permission: 'production_lines.view',
    items: [
      {
        title: 'Dashboard',
        url: '/production-lines',
        permission: 'production_lines.view',
      },
      {
        title: 'Nueva Línea',
        url: '/production-lines/new',
        permission: 'production_lines.create',
      },
    ],
  },

  // 8. Safety - OSHA compliance & safety workflows
  {
    title: 'Seguridad',
    url: '/safety/work-permits',
    icon: ShieldAlert,
    permission: 'work_orders.view',
    items: [
      {
        title: 'Permisos de Trabajo',
        url: '/safety/work-permits',
        permission: 'work_orders.view',
      },
      {
        title: 'Procedimientos LOTO',
        url: '/safety/loto-procedures',
        permission: 'work_orders.view',
      },
      {
        title: 'Análisis JSA',
        url: '/safety/job-safety-analyses',
        permission: 'work_orders.view',
      },
    ],
  },

  // 9. Quality - ISO 9001/55001 compliance
  {
    title: 'Calidad',
    url: '/quality/root-cause-analyses',
    icon: Target,
    permission: 'work_orders.view',
    items: [
      {
        title: 'Análisis RCA',
        url: '/quality/root-cause-analyses',
        permission: 'work_orders.view',
      },
      {
        title: 'Acciones CAPA',
        url: '/quality/cap-actions',
        permission: 'work_orders.view',
      },
    ],
  },

  // 10. Analytics - Reports & insights
  {
    title: 'Reportes',
    url: '/maintenance/analytics',
    icon: BarChart3,
    permission: 'assets.view',
    requiresFeature: 'hasPredictiveMaintenance',
    items: [
      {
        title: 'Analytics',
        url: '/maintenance/analytics',
        permission: 'assets.view',
      },
    ],
  },
]

/**
 * Feature-based navigation items
 * These are dynamically added based on enabled company features
 */
export const getMainFeatureNavItems = (enabledFeatures: {
  hasAttendance?: boolean
  hasTimeOff?: boolean
  hasPredictiveMaintenance?: boolean
}): NavigationItem[] => {
  const items: NavigationItem[] = []

  // Preventive Maintenance - Inserted after Work Orders (position 4)
  if (enabledFeatures.hasPredictiveMaintenance) {
    items.push({
      title: 'Mantenimiento Preventivo',
      url: '/maintenance/alerts',
      icon: Wrench,
      permission: 'assets.view',
      requiresFeature: 'hasPredictiveMaintenance',
      items: [
        {
          title: 'Alertas MTBF',
          url: '/maintenance/alerts',
          permission: 'assets.view',
        },
        {
          title: 'Planificación',
          url: '/maintenance/planning',
          permission: 'assets.view',
        },
      ],
    })
  }

  return items
}
