/**
 * Exploded View Form Component
 *
 * Main form component for creating/editing exploded views.
 * Follows project patterns: React Hook Form + Zod + shadcn/ui.
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { explodedViewFormSchema } from "@/schemas/exploded-view-form"
import type { z } from "zod"
import { ExplodedViewBasicInfo } from "./exploded-view/exploded-view-basic-info"

type ExplodedViewFormDataInferred = z.infer<typeof explodedViewFormSchema>

interface Asset {
  id: string
  name: string
  code: string
}

interface ExplodedViewFormProps {
  onSubmit: (data: ExplodedViewFormDataInferred) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<ExplodedViewFormDataInferred>
}

export function ExplodedViewForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
}: ExplodedViewFormProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)

  const form = useForm<ExplodedViewFormDataInferred>({
    resolver: zodResolver(explodedViewFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description ?? null,
      imageUrl: initialData?.imageUrl || "",
      imageWidth: initialData?.imageWidth || 1920,
      imageHeight: initialData?.imageHeight || 1080,
      order: initialData?.order ?? 0,
      assetId: initialData?.assetId || "",
      isActive: initialData?.isActive,
    },
  })

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoadingAssets(true)
      const response = await fetch("/api/admin/assets?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setAssets(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
    } finally {
      setLoadingAssets(false)
    }
  }

  const handleSubmit = (data: ExplodedViewFormDataInferred) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData ? "Editar Vista Explosionada" : "Nueva Vista Explosionada"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExplodedViewBasicInfo
              form={form}
              assets={assets}
              loadingAssets={loadingAssets}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
