"use client"

import { useUserRole } from "@/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageSkeleton } from "@/components/skeletons"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSuperAdmin, loading, isCompanyAdmin, isGroupAdmin } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isSuperAdmin && !isCompanyAdmin && !isGroupAdmin) {
      router.replace("/")
    }
  }, [isSuperAdmin, loading, router, isCompanyAdmin, isGroupAdmin])

  if (loading) {
    return <PageSkeleton />
  }

  if (!isSuperAdmin && !isCompanyAdmin && !isGroupAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">No tienes permiso para acceder a esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}