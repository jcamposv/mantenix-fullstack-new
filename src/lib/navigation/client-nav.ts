/**
 * Client Navigation Configuration
 *
 * External client user navigation for:
 * - CLIENTE_ADMIN_GENERAL (all sites)
 * - CLIENTE_ADMIN_SEDE (specific site)
 * - CLIENTE_OPERARIO (field operator)
 *
 * Limited access focused on:
 * - Viewing work orders at their sites
 * - Creating and tracking alerts
 * - Monitoring service provider performance
 *
 * Following Next.js Expert standards
 */

import { SquareTerminal, ClipboardList, AlertCircle } from 'lucide-react'
import type { NavigationItem } from './types'

/**
 * Main navigation for external client users
 * Simplified workflow focusing on monitoring and alerts
 */
export const CLIENT_NAV_ITEMS: NavigationItem[] = [
  // 1. Dashboard - Overview of client sites
  {
    title: 'Dashboard',
    url: '/',
    icon: SquareTerminal,
    isActive: true,
  },

  // 2. Work Orders - View and track service provider work
  {
    title: 'Órdenes de Trabajo',
    url: '/client/work-orders',
    icon: ClipboardList,
    items: [
      {
        title: 'Dashboard',
        url: '/client/work-orders',
      },
      {
        title: 'Lista de Órdenes',
        url: '/client/work-orders/list',
      },
      {
        title: 'Historial',
        url: '/client/work-orders/history',
      },
    ],
  },

  // 3. Alerts - Report issues and track responses
  {
    title: 'Alertas',
    url: '/client/alerts',
    icon: AlertCircle,
    badge: true,
    items: [
      {
        title: 'Mis Alertas',
        url: '/client/alerts',
      },
      {
        title: 'Crear Alerta',
        url: '/client/alerts/new',
      },
      {
        title: 'Historial',
        url: '/client/alerts/history',
      },
    ],
  },
]
