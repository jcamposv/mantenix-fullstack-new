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
  Factory,
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
        title: "Templates",
        url: "/admin/work-order-templates",
      },
      {
        title: "Prefijos de Numeración",
        url: "/admin/work-order-prefixes",
      },
    ],
  },
  {
    title: "Líneas de Producción",
    url: "/production-lines",
    icon: Factory,
    items: [
      {
        title: "Dashboard",
        url: "/production-lines",
      },
      {
        title: "Nueva Línea",
        url: "/production-lines/new",
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
    name: "Gestión",
    url: "/admin/assets",
    icon: Package,
    role: "ADMIN_EMPRESA", // Company and group admins - always visible
    items: [
      {
        title: "Activos",
        url: "/admin/assets",
      },
      {
        title: "Templates OT",
        url: "/admin/work-order-templates",
      },
      {
        title: "Inventario",
        url: "/admin/inventory",
      },
    ],
  },
  {
    name: "Clientes",
    url: "/admin/client-companies",
    icon: Building2,
    role: "ADMIN_EMPRESA", // Only visible with EXTERNAL_CLIENT_MANAGEMENT
    requiresFeature: "EXTERNAL_CLIENT_MANAGEMENT",
    items: [
      {
        title: "Empresas Cliente",
        url: "/admin/client-companies",
      },
      {
        title: "Sedes",
        url: "/admin/sites",
      },
    ],
  },
  {
    name: "Usuarios del Sistema",
    url: "/super-admin/users", // Super admin uses super-admin route
    icon: Users,
    role: "SUPER_ADMIN"
  },
  {
    name: "Usuarios",
    url: "/admin/users", // Company admin uses admin route
    icon: Users,
    role: "ADMIN_EMPRESA"
  },
  {
    name: "Features Premium",
    url: "/super-admin/features",
    icon: Sparkles,
    role: "SUPER_ADMIN" // Only super admins can manage premium features
  },
  {
    name: "Configuración de Emails",
    url: "/super-admin/email-configurations",
    icon: Mail,
    role: "SUPER_ADMIN" // Only super admins can manage email configurations
  },
  {
    name: "Configuración del Sistema",
    url: "/admin/settings",
    icon: Settings2,
    role: "SUPER_ADMIN" // Only super admins can see system settings
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

  return items
}

