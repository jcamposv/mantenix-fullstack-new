/**
 * Edit Authority Limit Page
 *
 * Page for editing existing authority limits.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Server component that fetches data
 * - Delegates to client component for form
 * - Type-safe
 */

import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AuthorityLimitForm } from '@/components/workflow/authority-limit-form'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EditAuthorityLimitPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAuthorityLimitPage({
  params,
}: EditAuthorityLimitPageProps) {
  // Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.companyId) {
    redirect('/login')
  }

  const { id } = await params

  // Get authority limit
  const authorityLimit = await prisma.authorityLimit.findUnique({
    where: { id },
  })

  if (!authorityLimit || authorityLimit.companyId !== session.user.companyId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Editar Límite de Autoridad</h1>
        <p className="text-muted-foreground mt-2">
          Modifica los límites de autorización y aprobación
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Información del Límite</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorityLimitForm
            authorityLimitId={id}
            initialData={{
              roleKey: authorityLimit.roleKey,
              maxDirectAuthorization: authorityLimit.maxDirectAuthorization,
              canCreateWorkOrders: authorityLimit.canCreateWorkOrders,
              canAssignDirectly: authorityLimit.canAssignDirectly,
              isActive: authorityLimit.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
