"use client"

import { useUserRole } from "@/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSuperAdmin, loading, isCompanyAdmin } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isSuperAdmin && !isCompanyAdmin) {
      router.replace("/")
    }
  }, [isSuperAdmin, loading, router, isCompanyAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don&apos;t have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}