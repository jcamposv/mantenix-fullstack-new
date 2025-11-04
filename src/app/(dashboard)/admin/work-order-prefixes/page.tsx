"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createWorkOrderPrefixSchema, type CreateWorkOrderPrefixSchema } from "@/schemas/work-order-prefix"
import { TableActions, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import type { WorkOrderPrefixWithRelations } from "@/types/work-order-prefix.types"

interface PrefixesResponse {
  prefixes?: WorkOrderPrefixWithRelations[]
  items?: WorkOrderPrefixWithRelations[]
}

export default function WorkOrderPrefixesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

	const { data: prefixes, refetch } = useTableData<WorkOrderPrefixWithRelations>({
    endpoint: '/api/work-order-prefixes?isActive=true',
    transform: (data) => (data as PrefixesResponse).prefixes || (data as PrefixesResponse).items || []
  })

  const form = useForm<CreateWorkOrderPrefixSchema>({
    resolver: zodResolver(createWorkOrderPrefixSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  })

  const handleAddPrefix = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCreate = async (data: CreateWorkOrderPrefixSchema) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/work-order-prefixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el prefijo')
      }

      toast.success("Prefijo creado exitosamente")
      setIsCreateDialogOpen(false)
      form.reset()
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el prefijo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (prefix: WorkOrderPrefixWithRelations) => {
    if (!confirm(`¿Estás seguro de eliminar el prefijo "${prefix.code}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/work-order-prefixes/${prefix.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Prefijo eliminado exitosamente')
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el prefijo')
      }
    } catch (error) {
      console.error('Error deleting prefix:', error)
      toast.error('Error al eliminar el prefijo')
    }
  }

  const columns: ColumnDef<WorkOrderPrefixWithRelations>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-base">
          {row.getValue("code")}
        </Badge>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null
        return (
          <div className="text-muted-foreground max-w-md truncate">
            {description || "—"}
          </div>
        )
      },
    },
    {
      id: "workOrders",
      header: "Órdenes",
      cell: ({ row }) => {
        const count = row.original._count?.workOrders || 0
        return (
          <Badge variant="secondary">
            {count} {count === 1 ? 'orden' : 'órdenes'}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const prefix = row.original
        return (
          <TableActions
            actions={[
              createDeleteAction(() => handleDelete(prefix))
            ]}
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Prefijos de Órdenes de Trabajo</h2>
            <p className="text-muted-foreground">
              Los prefijos permiten personalizar la numeración de órdenes de trabajo por proyecto, oficina o criterio específico.
            </p>
          </div>
          <Button onClick={handleAddPrefix}>Nuevo Prefijo</Button>
        </div>
        
        <DataTable
          columns={columns}
          data={prefixes}
        />
      </div>

      {/* Create Prefix Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Prefijo</DialogTitle>
            <DialogDescription>
              Define un nuevo prefijo para personalizar la numeración de órdenes de trabajo
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Prefijo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="NR, VH, PROY01..."
                        className="font-mono uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo 10 caracteres. Solo letras mayúsculas y números.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Descriptivo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Proyecto Norte, Oficina Heredia..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe el uso de este prefijo..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Prefijo"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
