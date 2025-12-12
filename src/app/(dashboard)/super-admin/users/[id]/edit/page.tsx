"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminUserForm } from "@/components/forms/super-admin-user-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import type { SystemRoleKey } from "@/types/auth.types"
import type { UserFormData } from "@/components/forms/user/user-form-schema"

export default function SuperAdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Extract userId from params
  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.id)
    })
  }, [params])

  // Use the new useUser hook with SWR
  const { user: userData, loading: fetchingUser, error } = useUser(userId)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el usuario')
      router.push('/super-admin/users')
    }
  }, [error, router])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          companyId: data.companyId,
          image: data.image,
        }),
      })

      if (response.ok) {
        toast.success('Usuario actualizado exitosamente')
        router.push('/super-admin/users')
        router.refresh()
      } else {
        const error = await response.json()
        console.error('Error updating user:', error)
        toast.error(error.error || 'Error al actualizar el usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center text-muted-foreground">Usuario no encontrado</div>
      </div>
    )
  }

  // Transform user data to form format
  const formInitialData: Partial<UserFormData> = {
    name: userData.name,
    email: userData.email,
    role: userData.role as SystemRoleKey,
    image: userData.image ?? null,
  }

  return (
    <div className="container mx-auto py-0">
      <SuperAdminUserForm
        initialData={formInitialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        mode="edit"
      />
    </div>
  )
}
