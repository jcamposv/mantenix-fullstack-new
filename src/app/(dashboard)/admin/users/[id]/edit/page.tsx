"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { UserForm } from "@/components/forms/user-form"
import { toast } from "sonner"
import { FormSkeleton } from "@/components/skeletons"
import { useUser } from "@/hooks/useUser"
import type { SystemRoleKey } from "@/types/auth.types"
import type { UserFormData } from "@/components/forms/user/user-form-schema"

export default function EditUserPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Use the new useUser hook with SWR
  const { user: initialData, loading: fetchLoading, error } = useUser(id)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar los datos del usuario')
      router.push('/admin/users')
    }
  }, [error, router])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Usuario actualizado exitosamente')
        router.push('/admin/users')
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

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-0">
        <FormSkeleton fields={5} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos del usuario.</p>
        </div>
      </div>
    )
  }

  // Transform user data to form format
  const formInitialData: Partial<UserFormData> = {
    name: initialData.name,
    email: initialData.email,
    role: initialData.role as SystemRoleKey,
    image: initialData.image ?? null,
  }

  return (
    <div className="container mx-auto py-0">
      <UserForm
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={formInitialData}
      />
    </div>
  )
}