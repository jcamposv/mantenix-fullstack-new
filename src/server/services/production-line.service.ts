import { Prisma } from '@prisma/client'
import { ProductionLineRepository } from '@/server/repositories/production-line.repository'
import { getCurrentCompanyId } from '@/lib/company-context'
import type { AuthenticatedSession } from '@/types/auth.types'
import type {
  ProductionLineWithRelations,
  ProductionLineFilters,
  CreateProductionLineData,
  UpdateProductionLineData,
  AddAssetToLineData,
  UpdateAssetInLineData,
  ProductionLineStats,
  FlowConfiguration,
} from '@/types/production-line.types'

/**
 * Production Line Service
 * Business logic layer for production lines
 * Following Next.js Expert: Service Pattern for business logic
 */
export class ProductionLineService {
  /**
   * Build where clause for filtering
   */
  private static buildWhereClause(
    filters: ProductionLineFilters = {},
    companyId?: string
  ): Prisma.ProductionLineWhereInput {
    const whereClause: Prisma.ProductionLineWhereInput = {
      isActive: true,
    }

    // Always filter by company for security
    if (companyId) {
      whereClause.companyId = companyId
    }

    if (filters.siteId) {
      whereClause.siteId = filters.siteId
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (typeof filters.isActive === 'boolean') {
      whereClause.isActive = filters.isActive
    }

    return whereClause
  }

  /**
   * Get all production lines with filtering and pagination
   */
  static async getProductionLines(
    session: AuthenticatedSession,
    filters: ProductionLineFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{
    items: ProductionLineWithRelations[]
    total: number
  }> {
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    const whereClause = this.buildWhereClause(filters, companyId)

    const { items, total } = await ProductionLineRepository.findMany(
      whereClause,
      pagination.page,
      pagination.limit
    )

    return { items, total }
  }

  /**
   * Get production line by ID
   */
  static async getProductionLineById(
    session: AuthenticatedSession,
    id: string
  ): Promise<ProductionLineWithRelations | null> {
    const companyId = await getCurrentCompanyId(session)

    const productionLine = await ProductionLineRepository.findById(
      id,
      companyId
    )

    if (!productionLine) {
      throw new Error('Línea de producción no encontrada')
    }

    // Permission check for external users
    if (
      session.user.role.startsWith('CLIENTE') &&
      session.user.siteId
    ) {
      if (productionLine.siteId !== session.user.siteId) {
        throw new Error(
          'No tienes permisos para ver esta línea de producción'
        )
      }
    }

    return productionLine
  }

  /**
   * Create new production line
   */
  static async createProductionLine(
    session: AuthenticatedSession,
    data: CreateProductionLineData
  ): Promise<ProductionLineWithRelations> {
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    // Permission check - only admins and supervisors can create
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
      'SUPERVISOR',
      'JEFE_MANTENIMIENTO',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para crear líneas de producción'
      )
    }

    // Check if code already exists
    const codeExists = await ProductionLineRepository.checkCodeExists(
      data.code,
      companyId
    )

    if (codeExists) {
      throw new Error(
        `El código "${data.code}" ya existe en otra línea de producción`
      )
    }

    // Prepare data for creation
    const createData: Prisma.ProductionLineCreateInput = {
      name: data.name,
      code: data.code,
      description: data.description,
      targetThroughput: data.targetThroughput,
      taktTime: data.taktTime,
      unitPrice: data.unitPrice,
      site: { connect: { id: data.siteId } },
      company: { connect: { id: companyId } },
    }

    return await ProductionLineRepository.create(createData)
  }

  /**
   * Update production line
   */
  static async updateProductionLine(
    session: AuthenticatedSession,
    id: string,
    data: UpdateProductionLineData
  ): Promise<ProductionLineWithRelations> {
    // Verify production line exists and user has access
    await this.getProductionLineById(session, id)

    const companyId = await getCurrentCompanyId(session)

    // Permission check
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
      'SUPERVISOR',
      'JEFE_MANTENIMIENTO',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para modificar líneas de producción'
      )
    }

    // Check if code already exists (if changing code)
    if (data.code && companyId) {
      const codeExists = await ProductionLineRepository.checkCodeExists(
        data.code,
        companyId,
        id
      )

      if (codeExists) {
        throw new Error(
          `El código "${data.code}" ya existe en otra línea de producción`
        )
      }
    }

    // Prepare update data
    const updateData: Prisma.ProductionLineUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.code && { code: data.code }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.siteId && { site: { connect: { id: data.siteId } } }),
      ...(data.targetThroughput !== undefined && {
        targetThroughput: data.targetThroughput,
      }),
      ...(data.taktTime !== undefined && { taktTime: data.taktTime }),
      ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
      ...(data.flowConfiguration && {
        flowConfiguration: data.flowConfiguration as unknown as Prisma.InputJsonValue,
      }),
      ...(typeof data.isActive === 'boolean' && {
        isActive: data.isActive,
      }),
    }

    return await ProductionLineRepository.update(id, updateData)
  }

  /**
   * Delete production line (soft delete)
   */
  static async deleteProductionLine(
    session: AuthenticatedSession,
    id: string
  ): Promise<ProductionLineWithRelations> {
    // Verify production line exists and user has access
    await this.getProductionLineById(session, id)

    // Permission check - only admins can delete
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para eliminar líneas de producción'
      )
    }

    return await ProductionLineRepository.softDelete(id)
  }

  /**
   * Add asset to production line
   */
  static async addAssetToLine(
    session: AuthenticatedSession,
    productionLineId: string,
    data: AddAssetToLineData
  ) {
    // Verify production line exists and user has access
    await this.getProductionLineById(session, productionLineId)

    // Permission check
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
      'SUPERVISOR',
      'JEFE_MANTENIMIENTO',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para modificar líneas de producción'
      )
    }

    const createData: Prisma.ProductionLineAssetCreateInput = {
      productionLine: { connect: { id: productionLineId } },
      asset: { connect: { id: data.assetId } },
      sequence: data.sequence,
      position: data.position as unknown as Prisma.InputJsonValue | undefined,
      cycleTime: data.cycleTime,
      capacity: data.capacity,
      nodeType: data.nodeType || 'machine',
    }

    return await ProductionLineRepository.addAsset(createData)
  }

  /**
   * Update asset in production line
   */
  static async updateAssetInLine(
    session: AuthenticatedSession,
    assetInLineId: string,
    data: UpdateAssetInLineData
  ) {
    // Permission check
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
      'SUPERVISOR',
      'JEFE_MANTENIMIENTO',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para modificar líneas de producción'
      )
    }

    const updateData: Prisma.ProductionLineAssetUpdateInput = {
      ...(data.sequence !== undefined && { sequence: data.sequence }),
      ...(data.position && {
        position: data.position as unknown as Prisma.InputJsonValue,
      }),
      ...(data.cycleTime !== undefined && { cycleTime: data.cycleTime }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.nodeType && { nodeType: data.nodeType }),
    }

    return await ProductionLineRepository.updateAsset(
      assetInLineId,
      updateData
    )
  }

  /**
   * Remove asset from production line
   */
  static async removeAssetFromLine(
    session: AuthenticatedSession,
    assetInLineId: string
  ): Promise<void> {
    // Permission check
    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN_GRUPO',
      'ADMIN_EMPRESA',
      'SUPERVISOR',
      'JEFE_MANTENIMIENTO',
    ]
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error(
        'No tienes permisos para modificar líneas de producción'
      )
    }

    await ProductionLineRepository.removeAsset(assetInLineId)
  }

  /**
   * Get production line stats
   */
  static async getStats(
    session: AuthenticatedSession
  ): Promise<ProductionLineStats> {
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error('No se pudo determinar la empresa')
    }

    return await ProductionLineRepository.getStats(companyId)
  }

  /**
   * Update flow configuration (React Flow state)
   * Also syncs assets from nodes to production_line_assets table
   */
  static async updateFlowConfiguration(
    session: AuthenticatedSession,
    productionLineId: string,
    flowConfiguration: FlowConfiguration
  ): Promise<ProductionLineWithRelations> {
    // First update the flow configuration
    await this.updateProductionLine(session, productionLineId, {
      flowConfiguration,
    })

    // Then sync assets from flow nodes to production_line_assets
    await this.syncAssetsFromFlow(session, productionLineId, flowConfiguration)

    // Return updated production line with assets
    const updated = await this.getProductionLineById(session, productionLineId)
    if (!updated) {
      throw new Error('Línea de producción no encontrada')
    }
    return updated
  }

  /**
   * Sync assets from flow configuration to production_line_assets table
   */
  private static async syncAssetsFromFlow(
    session: AuthenticatedSession,
    productionLineId: string,
    flowConfiguration: FlowConfiguration
  ): Promise<void> {
    // Extract asset IDs from flow nodes
    const assetNodes = flowConfiguration.nodes
      .filter((node) => node.data?.assetId)
      .map((node, index) => ({
        assetId: node.data.assetId as string,
        sequence: index + 1,
        position: node.position,
        cycleTime: node.data.cycleTime as number | undefined,
        capacity: node.data.capacity as number | undefined,
        nodeType: (node.type || 'machine') as 'machine' | 'buffer' | 'quality-check' | 'conveyor',
      }))

    // Get existing assets in production line
    const existingAssets = await ProductionLineRepository.getLineAssets(productionLineId)

    // Delete assets that are no longer in the flow
    const currentAssetIds = new Set(assetNodes.map((n) => n.assetId))
    for (const existing of existingAssets) {
      if (!currentAssetIds.has(existing.assetId)) {
        await ProductionLineRepository.removeAsset(existing.id)
      }
    }

    // Create or update assets from flow nodes
    const existingAssetMap = new Map(existingAssets.map((a) => [a.assetId, a]))

    for (const assetNode of assetNodes) {
      const existing = existingAssetMap.get(assetNode.assetId)

      if (existing) {
        // Update existing asset
        await ProductionLineRepository.updateAsset(existing.id, {
          sequence: assetNode.sequence,
          position: assetNode.position as unknown as Prisma.InputJsonValue,
          cycleTime: assetNode.cycleTime,
          capacity: assetNode.capacity,
          nodeType: assetNode.nodeType,
        })
      } else {
        // Create new asset relationship
        await ProductionLineRepository.addAsset({
          productionLine: { connect: { id: productionLineId } },
          asset: { connect: { id: assetNode.assetId } },
          sequence: assetNode.sequence,
          position: assetNode.position as unknown as Prisma.InputJsonValue,
          cycleTime: assetNode.cycleTime,
          capacity: assetNode.capacity,
          nodeType: assetNode.nodeType,
        })
      }
    }
  }
}
