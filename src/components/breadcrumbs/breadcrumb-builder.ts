import { routeMap } from "./breadcrumb-config"
import { getDisplayName, isIdSegment, type BreadcrumbItem } from "./breadcrumb-utils"

export const buildBreadcrumbs = (currentPath: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = []
  
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
      const isId = isIdSegment(segment)
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