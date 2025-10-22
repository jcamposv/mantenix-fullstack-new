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
]

export const ADMIN_NAV_ITEMS = [
  {
    name: "Compañías",
    url: "/super-admin/companies",
    icon: Building2,
    role: "SUPER_ADMIN" // Only super admins can see tenant companies
  },
  {
    name: "Órdenes de Trabajo",
    url: "/work-orders",
    icon: Bot,
    role: "ADMIN_EMPRESA", // Company admins and above can manage work orders
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

