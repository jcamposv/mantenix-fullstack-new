import { requireMobileRole, ATTENDANCE_ROLES } from "@/lib/mobile-auth"

export default async function AttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar en el servidor que el usuario tiene permiso para ver asistencia
  await requireMobileRole(ATTENDANCE_ROLES)

  return <>{children}</>
}
