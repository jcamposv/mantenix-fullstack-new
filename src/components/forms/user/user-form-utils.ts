export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive"
    case "ADMIN_GRUPO":
      return "default"
    case "ADMIN_EMPRESA":
      return "default"
    case "JEFE_MANTENIMIENTO":
      return "secondary"
    case "SUPERVISOR":
      return "secondary"
    case "CLIENTE_ADMIN_GENERAL":
    case "CLIENTE_ADMIN_SEDE":
      return "outline"
    default:
      return "outline"
  }
}

export const needsCompanyAssignment = (role: string): boolean => {
  // Only SUPER_ADMIN doesn't need company assignment
  // ADMIN_GRUPO needs company assignment (even though they also have companyGroupId)
  return !["SUPER_ADMIN"].includes(role)
}