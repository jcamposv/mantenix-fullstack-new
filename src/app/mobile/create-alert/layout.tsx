import { requireMobileRole, CREATE_ALERT_ROLES } from "@/lib/mobile-auth"

export default async function CreateAlertLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar en el servidor que el usuario tiene permiso para crear alertas
  // Solo usuarios externos (clientes) pueden crear alertas
  await requireMobileRole(CREATE_ALERT_ROLES)

  return <>{children}</>
}
