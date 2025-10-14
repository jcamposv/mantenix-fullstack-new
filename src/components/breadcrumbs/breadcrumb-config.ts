// Mapeo de rutas a nombres legibles en español
export const routeMap: Record<string, string> = {
  // Dashboard principal
  "/": "Dashboard",
  
  // Órdenes de trabajo
  "/work-orders": "Órdenes de Trabajo",
  "/work-orders/my": "Mis Órdenes",
  "/work-orders/new": "Crear Orden",
  
  // Reportes
  "/reports": "Reportes",
  "/reports/performance": "Rendimiento",
  "/reports/analytics": "Analíticas",
  
  // Administración
  "/admin": "Administración",
  "/admin/users": "Usuarios",
  "/admin/users/new": "Nuevo Usuario",
  "/admin/client-companies": "Compañías Cliente",
  "/admin/client-companies/new": "Nueva Compañía Cliente",
  "/admin/sites": "Sedes",
  "/admin/sites/new": "Nueva Sede",
  
  // Super Administración
  "/super-admin": "Super Administración",
  "/super-admin/companies": "Compañías",
  "/super-admin/companies/new": "Nueva Compañía",
  "/super-admin/users": "Usuarios",
  "/super-admin/users/new": "Nuevo Usuario",
  "/admin/settings": "Configuración del Sistema",
  
  // Configuraciones generales
  "/settings": "Configuración",
  "/settings/profile": "Perfil",
  "/settings/company": "Compañía",
  "/settings/billing": "Facturación",
  
  // Clientes
  "/clients": "Clientes",
  "/clients/new": "Nuevo Cliente",
  
  // Equipos
  "/equipment": "Equipos",
  "/equipment/new": "Nuevo Equipo",
}

// Mapeo de rutas padre para crear la jerarquía
export const parentRoutes: Record<string, string> = {
  "/work-orders/my": "/work-orders",
  "/work-orders/new": "/work-orders",
  "/reports/performance": "/reports",
  "/reports/analytics": "/reports",
  "/admin/users": "/admin",
  "/admin/users/new": "/admin/users",
  "/admin/client-companies": "/admin",
  "/admin/client-companies/new": "/admin/client-companies",
  "/admin/sites": "/admin",
  "/admin/sites/new": "/admin/sites",
  "/admin/settings": "/admin",
  "/super-admin/companies": "/super-admin",
  "/super-admin/companies/new": "/super-admin/companies",
  "/super-admin/users": "/super-admin",
  "/super-admin/users/new": "/super-admin/users",
  "/settings/profile": "/settings",
  "/settings/company": "/settings",
  "/settings/billing": "/settings",
  "/clients/new": "/clients",
  "/equipment/new": "/equipment",
}