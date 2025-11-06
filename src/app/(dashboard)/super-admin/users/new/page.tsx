"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminUserForm } from "@/components/forms/super-admin-user-form"
import { toast } from "sonner"

export default function SuperAdminInviteUserPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      // Send invitation instead of creating user directly
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          companyId: data.companyId,
          image: data.image,
          // Note: password is not needed for invitations
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Invitation sent successfully:', result)
        toast.success('Invitación enviada exitosamente')
        router.push('/super-admin/users')
      } else {
        const error = await response.json()
        console.error('Error sending invitation:', error)
        toast.error(error.error || 'Error al enviar la invitación')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Error al enviar la invitación')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <SuperAdminUserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        mode="invite" // Pass mode to indicate this is for invitations
      />
    </div>
  )
}