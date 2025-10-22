"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  type WorkOrderTemplateFormData
} from "@/schemas/work-order-template"

interface TemplateBasicInfoProps {
  form: UseFormReturn<WorkOrderTemplateFormData>
}

const STATUSES = ["ACTIVE", "INACTIVE"] as const

const COMMON_CATEGORIES = [
  "Mantenimiento Preventivo",
  "Mantenimiento Correctivo",
  "Inspección",
  "Limpieza",
  "Calibración",
  "Reparación",
  "Instalación",
  "Actualización"
]

export function TemplateBasicInfo({ form }: TemplateBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Nombre */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Template *</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Mantenimiento Preventivo Mensual"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Descripción */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe el propósito y alcance de este template..."
                className="min-h-[100px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categoría */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    placeholder="Escriba o seleccione una categoría"
                    {...field}
                    value={field.value || ""}
                  />
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CATEGORIES.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => field.onChange(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}