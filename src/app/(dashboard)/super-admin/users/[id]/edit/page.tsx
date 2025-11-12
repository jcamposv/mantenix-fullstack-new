"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminUserForm } from "@/components/forms/super-admin-user-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SuperAdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.id)
    })
  }, [params])

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          toast.error('Error al cargar el usuario')
          router.push('/super-admin/users')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Error al cargar el usuario')
        router.push('/super-admin/users')
      } finally {
        setFetchingUser(false)
      }
    }

    fetchUser()
  }, [userId, router])

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

  return (
    <div className="container mx-auto py-0">
      <SuperAdminUserForm
        initialData={userData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        mode="edit"
      />
    </div>
  )
}
