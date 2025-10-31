import { Skeleton } from "@/components/ui/skeleton"
import { TableRow, TableCell } from "@/components/ui/table"

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
  cellHeight?: string
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
  cellHeight = "h-12"
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="flex items-center gap-3">
                {/* Variación para hacer el skeleton más natural */}
                {colIndex === 0 ? (
                  // Primera columna suele tener más contenido
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ) : colIndex === columnCount - 1 ? (
                  // Última columna suele ser acciones
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  // Columnas del medio
                  <Skeleton className={`h-4 ${colIndex % 2 === 0 ? 'w-24' : 'w-16'}`} />
                )}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
