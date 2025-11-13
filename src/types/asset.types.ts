export interface Asset {
  id: string
  name: string
  code: string
  description: string | null
  location: string
  siteId: string
  images: string[]
  registrationDate: Date
  status: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: Date | null
  estimatedLifespan: number | null
  category: string | null
  customFields: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface AssetWithRelations extends Asset {
  site?: {
    id: string
    name: string
    clientCompany: {
      id: string
      name: string
      tenantCompanyId: string
    }
  } | null
  _count?: {
    workOrders: number
  }
}

export interface CreateAssetData {
  name: string
  code: string
  description?: string
  location: string
  siteId: string
  images?: string[]
  status?: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  manufacturer?: string
  model?: string
  serialNumber?: string
  purchaseDate?: Date
  estimatedLifespan?: number
  category?: string
  customFields?: Record<string, unknown>
}

export interface UpdateAssetData {
  name?: string
  code?: string
  description?: string
  location?: string
  siteId?: string
  images?: string[]
  status?: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  manufacturer?: string
  model?: string
  serialNumber?: string
  purchaseDate?: Date
  estimatedLifespan?: number
  category?: string
  customFields?: Record<string, unknown>
}

export interface AssetFilters {
  siteId?: string
  status?: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  category?: string
  search?: string
  isActive?: boolean
}

export interface PaginatedAssetsResponse {
  assets: AssetWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}