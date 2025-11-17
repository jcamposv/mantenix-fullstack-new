import type { Alert, AlertPriority, AlertType, AlertStatus, Site, User } from "@prisma/client"

export interface AlertWithRelations extends Alert {
  site: Pick<Site, 'id' | 'name' | 'address'> & {
    clientCompany: {
      id: string
      name: string
    }
  }
  reportedBy: Pick<User, 'id' | 'name' | 'email' | 'roleId'>
  assignedTo?: Pick<User, 'id' | 'name' | 'email' | 'roleId'> | null
  resolvedBy?: Pick<User, 'id' | 'name' | 'email' | 'roleId'> | null
  comments?: Array<{
    id: string
    content: string
    createdAt: Date
    author: Pick<User, 'id' | 'name' | 'email' | 'roleId'>
  }>
  _count?: {
    comments: number
  }
}

export interface AlertFilters {
  siteId?: string
  status?: AlertStatus
  priority?: AlertPriority
  type?: AlertType
  my?: 'reported' | 'assigned'
}

export interface PaginatedAlertsResponse {
  alerts: AlertWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateAlertData {
  title: string
  description: string
  type: AlertType
  priority: AlertPriority
  location?: string
  equipmentId?: string
  images?: string[]
  documents?: string[]
  estimatedResolutionTime?: number
  siteId?: string
}

export interface UpdateAlertData {
  title?: string
  description?: string
  type?: AlertType
  priority?: AlertPriority
  status?: AlertStatus
  location?: string
  equipmentId?: string
  images?: string[]
  documents?: string[]
  estimatedResolutionTime?: number
  actualResolutionTime?: number
  resolutionNotes?: string
  assignedToId?: string
}