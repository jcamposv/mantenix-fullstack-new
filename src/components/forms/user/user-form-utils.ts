export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive"
    case "ADMIN_EMPRESA":
      return "default"
    case "SUPERVISOR":
      return "secondary"
    default:
      return "outline"
  }
}

export const needsCompanyAssignment = (role: string): boolean => {
  return !["SUPER_ADMIN"].includes(role)
}