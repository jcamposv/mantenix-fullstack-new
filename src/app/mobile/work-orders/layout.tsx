import { requireMobileRole, WORK_ORDERS_ROLES } from "@/lib/mobile-auth"

export default async function WorkOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar en el servidor que el usuario tiene permiso para ver órdenes
  await requireMobileRole(WORK_ORDERS_ROLES)

  return <>{children}</>
}
