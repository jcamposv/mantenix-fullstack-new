/**
 * Component Hierarchy Display
 *
 * Displays parent-child relationships for ISO 14224 component hierarchy.
 * Shows parent component and child components with navigation links.
 *
 * Following Next.js Expert standards:
 * - Small focused component (<200 lines)
 * - Type-safe
 * - Reusable UI composition
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import Link from 'next/link'

interface HierarchyComponent {
  id: string
  name: string
  partNumber?: string | null
  hierarchyLevel: number
}

interface ComponentHierarchyProps {
  hierarchyLevel: number
  parentComponent?: HierarchyComponent | null
  childComponents?: HierarchyComponent[]
}

const HIERARCHY_LABELS = {
  4: 'Sistema',
  5: 'Subsistema',
  6: 'Componente',
}

export function ComponentHierarchy({
  hierarchyLevel,
  parentComponent,
  childComponents,
}: ComponentHierarchyProps) {
  // Don't render if no hierarchy data
  if (!parentComponent && (!childComponents || childComponents.length === 0)) {
    return null
  }

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Jerarquía de Componentes
        </CardTitle>
        <CardDescription>
          Nivel {hierarchyLevel} - {HIERARCHY_LABELS[hierarchyLevel as keyof typeof HIERARCHY_LABELS] || 'Desconocido'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parent Component */}
        {parentComponent && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Componente Padre
            </div>
            <Link
              href={`/admin/exploded-view-components/${parentComponent.id}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <div className="font-medium">{parentComponent.name}</div>
                {parentComponent.partNumber && (
                  <div className="text-sm text-muted-foreground font-mono mt-0.5">
                    {parentComponent.partNumber}
                  </div>
                )}
              </div>
              <Badge variant="outline">
                Nivel {parentComponent.hierarchyLevel}
              </Badge>
            </Link>
          </div>
        )}

        {/* Child Components */}
        {childComponents && childComponents.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Componentes Hijos ({childComponents.length})
            </div>
            <div className="space-y-2">
              {childComponents.slice(0, 3).map((child) => (
                <Link
                  key={child.id}
                  href={`/admin/exploded-view-components/${child.id}`}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <div>
                    <div className="font-medium">{child.name}</div>
                    {child.partNumber && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {child.partNumber}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Nivel {child.hierarchyLevel}
                  </Badge>
                </Link>
              ))}
              {childComponents.length > 3 && (
                <div className="text-xs text-center text-muted-foreground py-1">
                  +{childComponents.length - 3} más
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
