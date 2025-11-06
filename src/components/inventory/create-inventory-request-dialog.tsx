"use client"

import { useState, useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const createRequestSchema = z.object({
  inventoryItemId: z.string().min(1, "Selecciona un ítem"),
  requestedQuantity: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(1, "La cantidad debe ser mayor a 0")
  ),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),
  notes: z.string().optional(),
})

type CreateRequestFormData = z.infer<typeof createRequestSchema>

interface CreateInventoryRequestDialogProps {
  open: boolean
  onClose: () => void
  workOrderId: string
  onSuccess: () => void
}

interface InventoryItem {
  id: string
  code: string
  name: string
  unit: string
  company: {
    id: string
    name: string
  }
}

export function CreateInventoryRequestDialog({
  open,
  onClose,
  workOrderId,
  onSuccess,
}: CreateInventoryRequestDialogProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema) as Resolver<CreateRequestFormData>,
    defaultValues: {
      inventoryItemId: "",
      requestedQuantity: 1,
      urgency: "NORMAL",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchItems()
    }
  }, [open])

  const fetchItems = async () => {
    try {
      setLoadingItems(true)
      const response = await fetch("/api/admin/inventory/items")

      if (!response.ok) {
        throw new Error("Error al cargar ítems de inventario")
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast.error(error instanceof Error ? error.message : "Error al cargar ítems")
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSubmit = async (data: CreateRequestFormData) => {
    try {
      setSubmitting(true)

      // Get the selected item to extract the company ID
      const selectedItem = items.find(item => item.id === data.inventoryItemId)

      const response = await fetch("/api/admin/inventory/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workOrderId,
          inventoryItemId: data.inventoryItemId,
          requestedQuantity: data.requestedQuantity,
          urgency: data.urgency,
          notes: data.notes,
          sourceCompanyId: selectedItem?.company.id, // Include source company
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear solicitud")
      }

      form.reset()
      onSuccess()
    } catch (error) {
      console.error("Error creating request:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear solicitud")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedItem = items.find(item => item.id === form.watch("inventoryItemId"))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Inventario</DialogTitle>
          <DialogDescription>
            Solicita repuestos o materiales necesarios para esta orden de trabajo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ítem de Inventario</FormLabel>
                  <Select
                    disabled={loadingItems || submitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ítem">
                          {loadingItems ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando...
                            </span>
                          ) : (
                            field.value && selectedItem ? (
                              <div className="flex flex-col text-left">
                                <span>{selectedItem.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {selectedItem.code} • {selectedItem.company.name}
                                </span>
                              </div>
                            ) : (
                              "Selecciona un ítem"
                            )
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.code}</span>
                              <span>•</span>
                              <span className="text-blue-600">{item.company.name}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Solicitada</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        disabled={submitting}
                        {...field}
                        className="flex-1"
                      />
                      {selectedItem && (
                        <span className="text-sm text-muted-foreground">
                          {selectedItem.unit}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgencia</FormLabel>
                  <Select
                    disabled={submitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Indica qué tan urgente es esta solicitud
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={submitting}
                      placeholder="Detalles adicionales sobre la solicitud..."
                      className="resize-none"
                      rows={3}
                      {...field}
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
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || loadingItems}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
