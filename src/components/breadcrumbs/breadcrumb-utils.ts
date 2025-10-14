import { routeMap } from "./breadcrumb-config"

export interface BreadcrumbItem {
  path: string
  name: string
}

export const isIdSegment = (segment: string): boolean => {
  return /^[0-9a-f-]+$/i.test(segment)
}

export const getEditDisplayName = (parentPath: string): string => {
  const parentName = routeMap[parentPath]
  if (!parentName) return "Editar"
  
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

export const getDetailDisplayName = (parentPath: string): string => {
  const parentName = routeMap[parentPath]
  if (parentName) {
    return `${parentName} - Detalle`
  }
  return "Detalle"
}

export const getDisplayName = (path: string): string => {
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
    return getEditDisplayName(parentPath)
  }
  
  // Si el último segmento es un ID, usar el nombre de la ruta padre
  if (isIdSegment(lastSegment)) {
    const parentPath = "/" + segments.slice(0, -1).join("/")
    return getDetailDisplayName(parentPath)
  }
  
  // Fallback: capitalizar el último segmento
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
}