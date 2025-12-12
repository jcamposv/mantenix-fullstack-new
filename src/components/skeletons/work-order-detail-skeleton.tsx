import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function WorkOrderDetailSkeleton() {
  return (
    <div className="py-6">
      {/* Header con título y botones */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Información General Consolidada */}
        <Card className="shadow-none">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <div className="w-px h-4 bg-border" />
                <Skeleton className="h-6 w-20" />
                <div className="w-px h-4 bg-border" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Grid 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Columna 1: Detalles */}
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 w-28 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>

              {/* Columna 2: Programación */}
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div>
                  <Skeleton className="h-3 w-28 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>

              {/* Columna 3: Técnicos */}
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones y Notas de Seguridad */}
            <div className="space-y-3">
              <div>
                <Skeleton className="h-3 w-28 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Herramientas y Materiales */}
        <Card className="shadow-none">
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campo Personalizado 1 */}
        <Card className="shadow-none">
          <CardHeader className="pb-3 border-b">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        {/* Campo Personalizado 2 */}
        <Card className="shadow-none">
          <CardHeader className="pb-3 border-b">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card className="shadow-none">
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-52" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-36 mb-2" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
