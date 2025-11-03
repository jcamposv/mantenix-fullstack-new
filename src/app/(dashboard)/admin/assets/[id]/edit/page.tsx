"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { AssetForm } from "@/components/forms/asset-form"
import { toast } from "sonner"
import { AssetFormData } from "@/schemas/asset"
import { FormSkeleton } from "@/components/skeletons"

interface EditAssetPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditAssetPage({ params }: EditAssetPageProps) {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<Partial<AssetFormData> | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  const clientCompanyId = (session?.user as { clientCompanyId?: string })?.clientCompanyId || "temp"

  useEffect(() => {
    fetchAsset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAsset = async () => {
    try {
      setFetchLoading(true)
      const { id } = await params
      const response = await fetch(`/api/admin/assets/${id}`)
      
      if (response.ok) {
        const asset = await response.json()
        // Transform the data to match form format
        const formData: Partial<AssetFormData> = {
          name: asset.name,
          code: asset.code,
          description: asset.description,
          location: asset.location,
          siteId: asset.siteId,
          images: asset.images || [],
          status: asset.status,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serialNumber: asset.serialNumber,
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
          estimatedLifespan: asset.estimatedLifespan?.toString() || "",
          category: asset.category,
        }
        setInitialData(formData)
      } else {
        toast.error('Error al cargar el activo')
        router.push('/admin/assets')
      }
    } catch (error) {
      console.error('Error fetching asset:', error)
      toast.error('Error al cargar el activo')
      router.push('/admin/assets')
    } finally {
      setFetchLoading(false)
    }
  }

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