import React from "react"
import {
  BreadcrumbItem as UIBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItemProps {
  path: string
  name: string
  isLast: boolean
  showSeparator: boolean
}

export const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({
  path,
  name,
  isLast,
  showSeparator
}) => {
  return (
    <React.Fragment key={path}>
      {showSeparator && <BreadcrumbSeparator className="hidden md:block" />}
      <UIBreadcrumbItem className="hidden md:block">
        {isLast ? (
          <BreadcrumbPage>{name}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={path}>
            {name}
          </BreadcrumbLink>
        )}
      </UIBreadcrumbItem>
    </React.Fragment>
  )
}