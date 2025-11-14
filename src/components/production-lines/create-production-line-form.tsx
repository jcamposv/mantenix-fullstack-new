'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createProductionLineSchema,
  type CreateProductionLineFormData,
} from '@/schemas/production-line'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreateProductionLineFormProps {
  sites: Array<{
    id: string
    name: string
  }>
}

export function CreateProductionLineForm({
  sites,
}: CreateProductionLineFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateProductionLineFormData>({
    resolver: zodResolver(createProductionLineSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      siteId: '',
      targetThroughput: undefined,
      taktTime: undefined,
      unitPrice: undefined,
    },
  })

  const onSubmit = async (data: CreateProductionLineFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/production-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear línea de producción')
      }

      toast.success('Línea de producción creada exitosamente')

      // Redirect to the new production line detail page
      router.push(`/production-lines/${result.data.id}`)
    } catch (error) {
      console.error('Error creating production line:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al crear línea de producción'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Línea de Ensamblaje Principal"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nombre descriptivo de la línea de producción
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código *</FormLabel>
              <FormControl>
                <Input
                  placeholder="LINE-001"
                  {...field}
                  onChange={(e) => {
                    // Convert to uppercase automatically
                    field.onChange(e.target.value.toUpperCase())
                  }}
                />
              </FormControl>
              <FormDescription>
                Código único (solo letras mayúsculas, números, guiones y guiones
                bajos)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada de la línea de producción..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descripción opcional de la línea de producción
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Site */}
        <FormField
          control={form.control}
          name="siteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sede" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Sede donde se encuentra esta línea de producción
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Target Throughput */}
          <FormField
            control={form.control}
            name="targetThroughput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Throughput Objetivo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseInt(value) : undefined)
                    }}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Unidades por hora</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Takt Time */}
          <FormField
            control={form.control}
            name="taktTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Takt Time</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.0"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseFloat(value) : undefined)
                    }}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Segundos entre unidades</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Unit Price */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio por Unidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value ? parseFloat(value) : undefined)
                  }}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Costo/precio por unidad producida (usado para calcular pérdidas por paradas)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Línea de Producción
          </Button>
        </div>
      </form>
    </Form>
  )
}
