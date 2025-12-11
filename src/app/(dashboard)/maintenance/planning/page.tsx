/**
 * Maintenance Planning Page
 *
 * Shows work orders pending approval and scheduled maintenance.
 * Part of WORKFLOW_GAPS feature for approval workflow.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Custom hooks for data fetching
 * - Type-safe
 * - Under 200 lines
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Calendar } from 'lucide-react'
import { PendingApprovalsTab } from '@/components/maintenance/planning/pending-approvals-tab'
import { ScheduledWorkTab } from '@/components/maintenance/planning/scheduled-work-tab'

export default function MaintenancePlanningPage() {
  const [activeTab, setActiveTab] = useState('approvals')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planificación de Mantenimiento</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de aprobaciones y trabajo programado
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approvals" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Pendientes de Aprobación
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="h-4 w-4" />
            Trabajo Programado
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4 mt-6">
          <PendingApprovalsTab />
        </TabsContent>

        {/* Scheduled Work Tab */}
        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <ScheduledWorkTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
