"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { AssetForm } from "@/components/forms/asset-form"
import { toast } from "sonner"
import { AssetFormData } from "@/schemas/asset"
import { FormSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { Boxes } from "lucide-react"
import { useAsset } from "@/hooks/useAsset"

interface EditAssetPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditAssetPage({ params }: EditAssetPageProps) {
  const [loading, setLoading] = useState(false)
  const [assetId, setAssetId] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const clientCompanyId = (session?.user as { clientCompanyId?: string })?.clientCompanyId || "temp"

  // Extract assetId from params
  useEffect(() => {
    params.then(({ id }) => setAssetId(id))
  }, [params])

  // Use the new useAsset hook with SWR
  const { asset, loading: fetchLoading, error } = useAsset(assetId)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el activo')
      router.push('/admin/assets')
    }
  }, [error, router])

  // Transform asset data to form format
  const initialData = useMemo<Partial<AssetFormData> | null>(() => {
    if (!asset) return null

    return {
      name: asset.name,
      code: asset.code,
      description: asset.description ?? undefined,
      location: asset.location,
      siteId: asset.siteId,
      images: asset.images || [],
      status: asset.status,
      manufacturer: asset.manufacturer ?? undefined,
      model: asset.model ?? undefined,
      serialNumber: asset.serialNumber ?? undefined,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : undefined,
      estimatedLifespan: asset.estimatedLifespan ?? undefined,
      category: asset.category ?? undefined,
    }
  }, [asset])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const { id } = await params
      const response = await fetch(`/api/admin/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Activo actualizado exitosamente')
        router.push('/admin/assets')
      } else {
        const error = await response.json()
        console.error('Error updating asset:', error)
        toast.error(error.error || 'Error al actualizar el activo')
      }
    } catch (error) {
      console.error('Error updating asset:', error)
      toast.error('Error al actualizar el activo')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-0">
        <FormSkeleton fields={8} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center">
          <p>Activo no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-0">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/exploded-views?assetId=${assetId}`)}
        >
          <Boxes className="mr-2 h-4 w-4" />
          Vista Explosionada
        </Button>
      </div>
      <AssetForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
        clientCompanyId={clientCompanyId}
      />
    </div>
  )
}