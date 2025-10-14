import { Badge } from "@/components/ui/badge"

const ROLE_CONFIG = {
  SUPER_ADMIN: { variant: "destructive" as const, label: "Super Admin" },
  ADMIN_EMPRESA: { variant: "default" as const, label: "Admin Empresa" },
  SUPERVISOR: { variant: "secondary" as const, label: "Supervisor" },
  TECNICO: { variant: "outline" as const, label: "Técnico" },
  CLIENTE_ADMIN_GENERAL: { variant: "secondary" as const, label: "Cliente Admin" },
  CLIENTE_ADMIN_SEDE: { variant: "outline" as const, label: "Admin Sede" },
  CLIENTE_OPERARIO: { variant: "outline" as const, label: "Operario" },
} as const

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]
  
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {role}
      </Badge>
    )
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export const getRoleBadgeVariant = (role: string) => {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.variant || "outline"
}