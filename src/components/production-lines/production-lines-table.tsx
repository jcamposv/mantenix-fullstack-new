'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ArrowUpDown, Eye, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { ProductionLineWithRelations } from '@/types/production-line.types'

interface ProductionLinesTableProps {
  productionLines: ProductionLineWithRelations[]
}

/**
 * Production Lines Table Component
 * Professional table display using TanStack Table
 */
export function ProductionLinesTable({
  productionLines,
}: ProductionLinesTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lineToDelete, setLineToDelete] = useState<ProductionLineWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (line: ProductionLineWithRelations): void => {
    setLineToDelete(line)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!lineToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/production-lines/${lineToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar línea de producción')
      }

      toast.success('Línea de producción eliminada exitosamente')
      setDeleteDialogOpen(false)
      setLineToDelete(null)
      router.refresh() // Refresh server component data
    } catch (error) {
      console.error('Error deleting production line:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar línea de producción'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<ProductionLineWithRelations>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Nombre
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="space-y-1 min-w-[200px]">
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-sm text-muted-foreground font-mono">
              {row.original.code}
            </div>
          </div>
        ),
      },
      {
        id: 'site',
        accessorFn: (row) => row.site?.name,
        header: 'Sede',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.site?.name || '-'}</span>
        ),
      },
      {
        id: 'health',
        accessorFn: (row) => {
          const totalAssets = row._count?.assets || 0
          const operationalAssets =
            row.assets?.filter((a) => a.asset.status === 'OPERATIVO').length || 0
          return totalAssets > 0
            ? Math.round((operationalAssets / totalAssets) * 100)
            : 0
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Salud
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const totalAssets = row.original._count?.assets || 0
          const operationalAssets =
            row.original.assets?.filter((a) => a.asset.status === 'OPERATIVO')
              .length || 0
          const healthPercentage =
            totalAssets > 0
              ? Math.round((operationalAssets / totalAssets) * 100)
              : 0

          return (
            <Badge
              variant={
                healthPercentage >= 80
                  ? 'default'
                  : healthPercentage >= 50
                  ? 'outline'
                  : 'destructive'
              }
              className="text-xs"
            >
              {healthPercentage}%
            </Badge>
          )
        },
      },
      {
        id: 'assets',
        accessorFn: (row) => row._count?.assets || 0,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Activos
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const totalAssets = row.original._count?.assets || 0
          const operationalAssets =
            row.original.assets?.filter((a) => a.asset.status === 'OPERATIVO')
              .length || 0

          return (
            <div className="text-sm">
              <span className="font-semibold">{operationalAssets}</span>
              <span className="text-muted-foreground">/{totalAssets}</span>
              <span className="text-muted-foreground ml-1">operativos</span>
            </div>
          )
        },
      },
      {
        id: 'throughput',
        accessorFn: (row) => row.targetThroughput,
        header: 'Throughput',
        cell: ({ row }) => {
          const throughput = row.original.targetThroughput
          return throughput ? (
            <span className="text-sm font-medium">{throughput} u/h</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
      },
      {
        id: 'taktTime',
        accessorFn: (row) => row.taktTime,
        header: 'Takt Time',
        cell: ({ row }) => {
          const taktTime = row.original.taktTime
          return taktTime ? (
            <span className="text-sm font-medium">{taktTime}s</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/production-lines/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/production-lines/${row.original.id}/edit`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDeleteClick]
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={productionLines}
        searchKey="name"
        searchPlaceholder="Buscar líneas por nombre..."
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar línea de producción?"
        description={
          lineToDelete
            ? `¿Estás seguro de eliminar "${lineToDelete.name}" (${lineToDelete.code})? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  )
}
