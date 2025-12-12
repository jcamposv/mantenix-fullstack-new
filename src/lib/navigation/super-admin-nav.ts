/**
 * Super Admin Navigation Configuration
 *
 * SaaS platform management for SUPER_ADMIN role:
 * - Multi-tenant company management
 * - Subscription & billing
 * - System-wide configuration
 * - Email & notifications
 *
 * Following Next.js Expert standards
 */

import {
  SquareTerminal,
  Building2,
  Network,
  CreditCard,
  Users,
  Sparkles,
  Mail,
} from 'lucide-react'
import type { NavigationItem, NavigationGroup } from './types'

/**
 * Main navigation for Super Admin
 * Minimal nav focused on platform overview
 */
export const SUPER_ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/super-admin/dashboard',
    icon: SquareTerminal,
    isActive: true,
  },
]

/**
 * Admin panel navigation for Super Admin
 * Full SaaS platform management
 */
export const SUPER_ADMIN_PANEL_GROUPS: NavigationGroup[] = [
  // Tenant Management
  {
    title: 'Gestión de Tenants',
    items: [
      {
        title: 'Compañías',
        url: '/super-admin/companies',
        icon: Building2,
      },
      {
        title: 'Grupos Corporativos',
        url: '/admin/company-groups',
        icon: Network,
      },
    ],
  },

  // Subscription & Billing
  {
    title: 'Suscripciones',
    items: [
      {
        title: 'Planes de Suscripción',
        url: '/super-admin/subscription-plans',
        icon: CreditCard,
      },
      {
        title: 'Features Premium',
        url: '/super-admin/features',
        icon: Sparkles,
      },
    ],
  },

  // System Users & Configuration
  {
    title: 'Sistema',
    items: [
      {
        title: 'Usuarios del Sistema',
        url: '/super-admin/users',
        icon: Users,
      },
      {
        title: 'Configuración de Emails',
        url: '/super-admin/email-configurations',
        icon: Mail,
      },
    ],
  },
]
