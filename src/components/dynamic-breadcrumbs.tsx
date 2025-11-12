"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb"
import { buildBreadcrumbs } from "./breadcrumbs/breadcrumb-builder"
import { BreadcrumbItemComponent } from "./breadcrumbs/breadcrumb-item"

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  
  // Si estamos en el dashboard principal, no mostrar breadcrumbs
  if (pathname === "/dashboard") {
    return null
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
          const showSeparator = index > 0
          
          return (
            <BreadcrumbItemComponent
              key={crumb.path}
              path={crumb.path}
              name={crumb.name}
              isLast={isLast}
              showSeparator={showSeparator}
            />
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}