export interface Alert {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  location?: string
  equipmentId?: string
  estimatedResolutionTime?: number
  images?: string[]
  documents?: string[]
  reportedAt: string
  resolvedAt?: string
  site: {
    id: string
    name: string
    address: string
    clientCompany?: {
      id: string
      name: string
    }
  }
  reportedBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  resolvedBy?: {
    id: string
    name: string
    email: string
  }
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}