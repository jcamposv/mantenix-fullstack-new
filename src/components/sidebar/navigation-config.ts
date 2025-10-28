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
} from "lucide-react"

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
    name: "Clientes",
    url: "/admin/client-companies", 
    icon: Building2,
    role: "ADMIN_EMPRESA", // Only company admins can see client companies
    items: [
      {
        title: "Clientes",
        url: "/admin/client-companies",
      },
      {
        title: "Sedes",
        url: "/admin/sites",
      },
      {
        title: "Activos",
        url: "/admin/assets",
      },
      {
        title: "Templates OT",
        url: "/admin/work-order-templates",
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
    name: "Usuarios de la Empresa",
    url: "/admin/users", // Company admin uses admin route
    icon: Users,
    role: "ADMIN_EMPRESA"
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

