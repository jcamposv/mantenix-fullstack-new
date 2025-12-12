"use client"

/**
 * Unified Dashboard Page
 *
 * Shows different dashboards based on user permissions:
 * - SUPER_ADMIN → redirects to /super-admin/dashboard
 * - dashboard.view_global → Executive Dashboard
 * - dashboard.view_client → Client Dashboard
 * - default → Operations Dashboard
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardLoading } from "@/components/dashboard/shared/dashboard-loading"
import { ExecutiveDashboard } from "@/components/dashboard/company/executive-dashboard"
import { OperationsDashboardEnhanced } from "@/components/dashboard/company/operations-dashboard-enhanced"
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard"

export default function Home() {
  const router = useRouter()
  const { isSuperAdmin, isLoading: authLoading } = useAuth()
  const { hasPermission, loading: permissionsLoading } = usePermissions()

  // Redirect SUPER_ADMIN to their dashboard
  useEffect(() => {
    if (!authLoading && isSuperAdmin()) {
      router.push('/super-admin/dashboard')
    }
  }, [authLoading, isSuperAdmin, router])

  // Show loading state while checking permissions
  if (authLoading || permissionsLoading || (!authLoading && isSuperAdmin())) {
    return (
      <div className="container mx-auto py-0">
        <DashboardLoading />
      </div>
    )
  }

  // Determine which dashboard to show based on permissions
  if (hasPermission('dashboard.view_global')) {
    return <ExecutiveDashboard />
  }

  if (hasPermission('dashboard.view_client')) {
    return <ClientDashboard />
  }

  // Default: Enhanced Operations Dashboard
  return <OperationsDashboardEnhanced />
}
