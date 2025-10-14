"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mapeo de rutas a nombres legibles en español
const routeMap: Record<string, string> = {
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
const parentRoutes: Record<string, string> = {
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

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  
  // Si estamos en el dashboard principal, no mostrar breadcrumbs
  if (pathname === "/dashboard") {
    return null
  }
  
  // Función para construir la cadena de breadcrumbs
  const buildBreadcrumbs = (currentPath: string): { path: string; name: string }[] => {
    const breadcrumbs: { path: string; name: string }[] = []
    
    // Agregar el dashboard como raíz siempre
    breadcrumbs.push({ path: "/", name: "Dashboard" })
    
    // Para rutas dinámicas, construir la jerarquía manualmente
    const segments = currentPath.split("/").filter(Boolean)
    
    if (segments.length >= 2) {
      // Construir breadcrumbs paso a paso
      let currentRoute = ""
      
      for (let i = 0; i < segments.length; i++) {
        currentRoute += "/" + segments[i]
        
        // Skip IDs in the breadcrumb path, but include edit routes
        const segment = segments[i]
        const isId = /^[0-9a-f-]+$/i.test(segment)
        const isEdit = segment === "edit"
        
        if (!isId || isEdit) {
          let name = getDisplayName(currentRoute)
          
          // For edit routes, we want to show the parent collection name first
          if (isEdit && i > 0) {
            const parentRoute = "/" + segments.slice(0, i - 1).join("/")
            const parentName = routeMap[parentRoute]
            if (parentName) {
              // Add parent collection if not already in breadcrumbs
              const parentExists = breadcrumbs.some(b => b.path === parentRoute)
              if (!parentExists) {
                breadcrumbs.push({ path: parentRoute, name: parentName })
              }
            }
          }
          
          breadcrumbs.push({ path: currentRoute, name })
        }
      }
    }
    
    return breadcrumbs
  }
  
  // Manejar rutas dinámicas (como /admin/users/[id])
  const getDisplayName = (path: string): string => {
    // Si la ruta exacta existe en el mapa, usarla
    if (routeMap[path]) {
      return routeMap[path]
    }
    
    // Manejar rutas con parámetros dinámicos
    const segments = path.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    
    // Manejar rutas de edición
    if (lastSegment === "edit") {
      const parentSegments = segments.slice(0, -2) // Remove ID and "edit"
      const parentPath = "/" + parentSegments.join("/")
      const parentName = routeMap[parentPath]
      if (parentName) {
        // Special cases for proper Spanish grammar
        if (parentName === "Compañías Cliente") {
          return "Editar Compañía Cliente"
        } else if (parentName === "Sedes") {
          return "Editar Sede"
        } else if (parentName === "Usuarios") {
          return "Editar Usuario"
        }
        // Default: just add "Editar" prefix
        return `Editar ${parentName}`
      }
    }
    
    // Si el último segmento es un ID (números o UUIDs), usar el nombre de la ruta padre
    if (/^[0-9a-f-]+$/i.test(lastSegment)) {
      const parentPath = "/" + segments.slice(0, -1).join("/")
      const parentName = routeMap[parentPath]
      if (parentName) {
        return `${parentName} - Detalle`
      }
    }
    
    // Fallback: capitalizar el último segmento
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }
  
  const breadcrumbs = buildBreadcrumbs(pathname)
  
  // Si solo tenemos el dashboard, no mostrar breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          
          return (
            <React.Fragment key={crumb.path}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                {isLast ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.path}>
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}