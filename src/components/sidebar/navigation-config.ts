/**
 * Sidebar navigation configuration
 * Contains all navigation items definitions
 */

import {
  Bot,
  Building2,
  Settings2,
  SquareTerminal,
  Users,
  Bell,
  ClipboardList,
  AlertCircle,
  Mail,
  Sparkles,
  Clock,
  Calendar,
  FileText,
  Package,
  CreditCard,
} from "lucide-react"

// Navigation items for SUPER_ADMIN (SaaS administrator)
export const SUPER_ADMIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/",
    icon: SquareTerminal,
    isActive: true,
  },
]

// Navigation items for regular users (company/group admins and operators)
export const BASE_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/",
    icon: SquareTerminal,
    isActive: true,
  },
  {
    title: "Alertas",
    url: "/alerts",
    icon: Bell,
    badge: true,
    items: [
      {
        title: "Todas las Alertas",
        url: "/alerts",
      },
      {
        title: "Mis Alertas",
        url: "/alerts/my",
      },
      {
        title: "Críticas",
        url: "/alerts/critical",
      },
    ],
  },
  {
    title: "Órdenes de Trabajo",
    url: "/work-orders",
    icon: Bot,
    items: [
      {
        title: "Dashboard",
        url: "/work-orders",
      },
      {
        title: "Lista de Órdenes",
        url: "/work-orders/list",
      },
      {
        title: "Mis Órdenes",
        url: "/work-orders/my",
      },
      {
        title: "Crear Orden",
        url: "/work-orders/new/select-template",
      },
      {
        title: "Aprobaciones",
        url: "/admin/work-orders/approvals",
        badge: true,
      },
      {
        title: "Templates",
        url: "/admin/work-order-templates",
      },
      {
        title: "Prefijos de Numeración",
        url: "/admin/work-order-prefixes",
      },
    ],
  },
]

// Navigation for external client users (CLIENTE_ADMIN_GENERAL, CLIENTE_ADMIN_SEDE, CLIENTE_OPERARIO)
export const CLIENT_NAV_ITEMS = [
  {
    title: "Órdenes de Trabajo",
    url: "/client/work-orders",
    icon: ClipboardList,
    isActive: true,
    items: [
      {
        title: "Dashboard",
        url: "/client/work-orders",
      },
      {
        title: "Lista de Órdenes",
        url: "/client/work-orders/list",
      },
    ],
  },
  {
    title: "Alertas",
    url: "/client/alerts",
    icon: AlertCircle,
    items: [
      {
        title: "Mis Alertas",
        url: "/client/alerts",
      },
      {
        title: "Crear Alerta",
        url: "/client/alerts/new",
      },
    ],
  },
]

export const ADMIN_NAV_ITEMS = [
  {
    name: "Compañías",
    url: "/super-admin/companies",
    icon: Building2,
    role: "SUPER_ADMIN" // Only super admins can see tenant companies
  },
  {
    name: "Grupos Corporativos",
    url: "/admin/company-groups",
    icon: Building2,
    role: "SUPER_ADMIN" // Super admins can manage company groups
  },
  {
    name: "Grupos Corporativos",
    url: "/admin/company-groups",
    icon: Building2,
    role: "ADMIN_GRUPO" // Group admins can manage company groups
  },
  {
    name: "Clientes",
    url: "/admin/client-companies",
    icon: Building2,
    role: "ADMIN_EMPRESA", // Only shown if EXTERNAL_CLIENT_MANAGEMENT is enabled
    items: [
      {
        title: "Clientes",
        url: "/admin/client-companies",
      },
      {
        title: "Sedes",
        url: "/admin/sites",
      },
    ],
  },
  {
    name: "Activos",
    url: "/admin/assets",
    icon: Building2,
    role: "ADMIN_GRUPO", // Always shown for group admins
  },
  {
    name: "Activos",
    url: "/admin/assets",
    icon: Building2,
    role: "ADMIN_EMPRESA", // Always shown for company admins
  },
  // ========================================
  // SUPER ADMIN - Gestión de Sistema
  // ========================================
  {
    name: "Gestión de Empresas",
    url: "/super-admin/companies",
    icon: Building2,
    role: "SUPER_ADMIN",
    items: [
      {
        title: "Empresas",
        url: "/super-admin/companies",
      },
      {
        title: "Usuarios del Sistema",
        url: "/super-admin/users",
      },
    ],
  },

  // ========================================
  // SUPER ADMIN - Facturación y Planes
  // ========================================
  {
    name: "Facturación",
    url: "/super-admin/subscription-plans",
    icon: CreditCard,
    role: "SUPER_ADMIN",
    items: [
      {
        title: "Planes de Subscripción",
        url: "/super-admin/subscription-plans",
      },
      {
        title: "Subscripciones",
        url: "/super-admin/subscriptions",
      },
    ],
  },

  // ========================================
  // SUPER ADMIN - Configuración
  // ========================================
  {
    name: "Configuración",
    url: "/super-admin/features",
    icon: Settings2,
    role: "SUPER_ADMIN",
    items: [
      {
        title: "Features Premium",
        url: "/super-admin/features",
      },
      {
        title: "Configuración de Emails",
        url: "/super-admin/email-configurations",
      },
      {
        title: "Ajustes del Sistema",
        url: "/admin/settings",
      },
    ],
  },

  // ========================================
  // ADMIN_GRUPO - Users
  // ========================================
  {
    name: "Usuarios del Grupo",
    url: "/admin/users",
    icon: Users,
    role: "ADMIN_GRUPO" // Group admins can manage users in group companies
  },

  // ========================================
  // ADMIN_EMPRESA - Users
  // ========================================
  {
    name: "Usuarios de la Empresa",
    url: "/admin/users",
    icon: Users,
    role: "ADMIN_EMPRESA"
  },
]

export const FALLBACK_USER = {
  name: "Usuario",
  email: "user@example.com",
  avatar: "/avatars/default.jpg",
}

// Features habilitados dinámicamente
export const getFeatureNavItems = (enabledFeatures: {
  hasAttendance?: boolean
  hasVacations?: boolean
  hasPermissions?: boolean
  hasExternalClientMgmt?: boolean
  hasInternalCorporateGroup?: boolean
}) => {
  const items = []

  // HR Features
  if (enabledFeatures.hasAttendance) {
    items.push({
      title: "Asistencia",
      url: "/admin/attendance",
      icon: Clock,
      items: [
        {
          title: "Registros",
          url: "/admin/attendance"
        },
        {
          title: "Reportes",
          url: "/admin/attendance/reports"
        },
        {
          title: "Ubicaciones",
          url: "/admin/locations"
        }
      ]
    })
  }

  if (enabledFeatures.hasVacations) {
    items.push({
      title: "Vacaciones",
      url: "/admin/vacations",
      icon: Calendar,
      items: [
        {
          title: "Solicitudes",
          url: "/admin/vacations"
        },
        {
          title: "Balance",
          url: "/admin/vacations/balance"
        }
      ]
    })
  }

  if (enabledFeatures.hasPermissions) {
    items.push({
      title: "Permisos",
      url: "/admin/permissions",
      icon: FileText,
      items: [
        {
          title: "Solicitudes",
          url: "/admin/permissions"
        }
      ]
    })
  }

  // Inventory (available if either feature is enabled)
  if (enabledFeatures.hasExternalClientMgmt || enabledFeatures.hasInternalCorporateGroup) {
    items.push({
      title: "Inventario",
      url: "/admin/inventory/dashboard",
      icon: Package,
      items: [
        {
          title: "Dashboard",
          url: "/admin/inventory/dashboard"
        },
        {
          title: "Productos",
          url: "/admin/inventory/items"
        },
        {
          title: "Entregas",
          url: "/admin/inventory/requests",
          badge: true,
        },
        {
          title: "Movimientos",
          url: "/admin/inventory/movements"
        }
      ]
    })
  }

  return items
}

