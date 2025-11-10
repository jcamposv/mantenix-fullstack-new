"use client";

import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbList } from '@/components/ui/breadcrumb';
import { buildBreadcrumbs } from './breadcrumbs/breadcrumb-builder';
import { BreadcrumbItemComponent } from './breadcrumbs/breadcrumb-item';

/**
 * DynamicBreadcrumbs Component
 * Displays navigation breadcrumbs based on current route
 * Optimized for minimal space usage with compact styling
 * Automatically hides on dashboard root and single-level routes
 */
export function DynamicBreadcrumbs(): JSX.Element | null {
  const pathname = usePathname();

  // Si estamos en el dashboard principal, no mostrar breadcrumbs
  if (pathname === '/dashboard') {
    return null;
  }

  const breadcrumbs = buildBreadcrumbs(pathname);

  // Si solo tenemos el dashboard, no mostrar breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="text-xs">
      <BreadcrumbList className="gap-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const showSeparator = index > 0;

          return (
            <BreadcrumbItemComponent
              key={crumb.path}
              path={crumb.path}
              name={crumb.name}
              isLast={isLast}
              showSeparator={showSeparator}
            />
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}