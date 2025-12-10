/**
 * Admin Navigation Configuration
 *
 * Configuration & management items for:
 * - Company administrators (ADMIN_EMPRESA)
 * - Group administrators (ADMIN_GRUPO)
 *
 * Feature-dependent sections:
 * - External client management
 * - Attendance & time-off
 *
 * Following Next.js Expert standards
 */

import {
  Package,
  ClipboardList,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  Calendar,
} from 'lucide-react'
import type { NavigationGroup } from './types'

export const ADMIN_NAV_GROUPS: NavigationGroup[] = [
  // Primary Management Group
  {
    title: 'Gestión',
    items: [
      {
        title: 'Activos',
        url: '/admin/assets',
        icon: Package,
        permission: 'assets.view',
      },
      {
        title: 'Templates OT',
        url: '/admin/work-order-templates',
        icon: ClipboardList,
        permission: 'work_orders.manage_templates',
      },
      {
        title: 'Prefijos de Numeración',
        url: '/admin/work-order-prefixes',
        icon: ClipboardList,
        permission: 'work_orders.manage_prefixes',
      },
      {
        title: 'Inventario',
        url: '/admin/inventory',
        icon: Package,
        permission: 'inventory.view',
      },
    ],
  },

  // User & Access Management
  {
    title: 'Usuarios y Accesos',
    items: [
      {
        title: 'Usuarios',
        url: '/admin/users',
        icon: Users,
        permission: 'users.view',
      },
      {
        title: 'Roles Personalizados',
        url: '/admin/roles',
        icon: ShieldCheck,
        permission: 'custom_roles.view',
      },
    ],
  },
]

/**
 * Feature-dependent admin navigation items
 * Requires EXTERNAL_CLIENT_MANAGEMENT feature
 */
export const getClientManagementNav = (): NavigationGroup => ({
  title: 'Clientes',
  items: [
    {
      title: 'Empresas Cliente',
      url: '/admin/client-companies',
      icon: Building2,
      requiresFeature: 'hasExternalClientMgmt',
    },
    {
      title: 'Sedes',
      url: '/admin/sites',
      icon: Building2,
      requiresFeature: 'hasExternalClientMgmt',
    },
  ],
})

/**
 * Feature-dependent admin navigation items
 * Requires ATTENDANCE feature
 */
export const getAttendanceManagementNav = (): NavigationGroup => ({
  title: 'Recursos Humanos',
  items: [
    {
      title: 'Asistencia',
      url: '/admin/attendance',
      icon: Clock,
      permission: 'attendance.view',
      requiresFeature: 'hasAttendance',
      items: [
        {
          title: 'Registros',
          url: '/admin/attendance',
          permission: 'attendance.view',
        },
        {
          title: 'Reportes',
          url: '/admin/attendance/reports',
          permission: 'attendance.view_reports',
        },
        {
          title: 'Ubicaciones',
          url: '/admin/locations',
          permission: 'locations.view',
        },
      ],
    },
  ],
})

/**
 * Feature-dependent admin navigation items
 * Requires TIME_OFF feature
 */
export const getTimeOffManagementNav = (): NavigationGroup => ({
  title: 'Vacaciones',
  items: [
    {
      title: 'Solicitudes',
      url: '/admin/time-off',
      icon: Calendar,
      requiresFeature: 'hasTimeOff',
      items: [
        {
          title: 'Solicitudes',
          url: '/admin/time-off',
        },
        {
          title: 'Mi Balance',
          url: '/admin/time-off/balance',
        },
        {
          title: 'Calendario',
          url: '/admin/time-off/calendar',
        },
      ],
    },
  ],
})

/**
 * Build admin navigation with feature flags
 */
export function buildAdminNavigation(enabledFeatures: {
  hasExternalClientMgmt?: boolean
  hasAttendance?: boolean
  hasTimeOff?: boolean
}): NavigationGroup[] {
  const groups: NavigationGroup[] = [...ADMIN_NAV_GROUPS]

  // Add client management if feature is enabled
  if (enabledFeatures.hasExternalClientMgmt) {
    groups.push(getClientManagementNav())
  }

  // Add attendance management if feature is enabled
  if (enabledFeatures.hasAttendance) {
    groups.push(getAttendanceManagementNav())
  }

  // Add time-off management if feature is enabled
  if (enabledFeatures.hasTimeOff) {
    groups.push(getTimeOffManagementNav())
  }

  return groups
}
