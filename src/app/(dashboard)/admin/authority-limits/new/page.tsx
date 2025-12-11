/**
 * Create Authority Limit Page
 *
 * Page for creating new authority limits for roles.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Server component for layout
 * - Delegates to client component for form (which fetches roles)
 * - Type-safe
 */

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AuthorityLimitForm } from '@/components/workflow/authority-limit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewAuthorityLimitPage() {
  // Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.companyId) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Límite de Autoridad</h1>
        <p className="text-muted-foreground mt-2">
          Define los límites de autorización y aprobación para un rol
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Información del Límite</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthorityLimitForm />
        </CardContent>
      </Card>
    </div>
  )
}
