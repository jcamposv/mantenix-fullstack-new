export interface AuthenticatedSession {
  user: {
    id: string
    role: string
    companyId?: string
    clientCompanyId?: string
    siteId?: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  companyId?: string
  clientCompanyId?: string
  siteId?: string
}