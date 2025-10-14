"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { UserForm } from "@/components/forms/user-form"
import { toast } from "sonner"

export default function EditUserPage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInitialData(data)
      } else {
        const error = await response.json()
        console.error('Error fetching user:', error)
        toast.error(error.error || 'Error al cargar los datos del usuario')
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Error al cargar los datos del usuario')
      router.push('/admin/users')
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando datos del usuario...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos del usuario.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <UserForm
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}