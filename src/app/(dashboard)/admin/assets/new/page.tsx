"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { AssetForm } from "@/components/forms/asset-form"
import { toast } from "sonner"

export default function NewAssetPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const clientCompanyId = (session?.user as { clientCompanyId?: string })?.clientCompanyId || "temp"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Activo creado exitosamente')
        router.push('/admin/assets')
      } else {
        const error = await response.json()
        console.error('Error creating asset:', error)
        toast.error(error.error || 'Error al crear el activo')
      }
    } catch (error) {
      console.error('Error creating asset:', error)
      toast.error('Error al crear el activo')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <AssetForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        clientCompanyId={clientCompanyId}
      />
    </div>
  )
}