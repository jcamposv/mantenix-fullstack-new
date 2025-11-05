"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { companyGroupSchema, type CompanyGroupFormData } from "@/schemas/inventory"
import { Loader2 } from "lucide-react"

interface CompanyGroupFormProps {
  initialData?: Partial<CompanyGroupFormData>
  onSubmit: (data: CompanyGroupFormData) => Promise<void>
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function CompanyGroupForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create"
}: CompanyGroupFormProps) {
  const form = useForm<CompanyGroupFormData>({
    resolver: zodResolver(companyGroupSchema) as Resolver<CompanyGroupFormData>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      shareInventory: initialData?.shareInventory ?? true,
      autoApproveTransfers: initialData?.autoApproveTransfers ?? false,
      companyIds: initialData?.companyIds || [],
    },
  })

  const handleSubmit = async (data: CompanyGroupFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Grupo</CardTitle>
            <CardDescription>
              Datos básicos del grupo corporativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Grupo Empresarial ABC" {...field} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del grupo corporativo"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Inventario</CardTitle>
            <CardDescription>
              Opciones para el manejo de inventario entre empresas del grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="shareInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Compartir Inventario
                    </FormLabel>
                    <FormDescription>
                      Las empresas del grupo pueden ver y usar el inventario compartido
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoApproveTransfers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-Aprobar Transferencias
                    </FormLabel>
                    <FormDescription>
                      Las transferencias de inventario entre empresas del grupo se aprueban automáticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Grupo" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
