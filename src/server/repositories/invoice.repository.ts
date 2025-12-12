import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { InvoiceWithRelations, InvoiceFilters } from "@/types/subscription.types"

/**
 * Repository para el acceso a datos de facturas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class InvoiceRepository {

  private static readonly includeRelations = {
    subscription: {
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    },
  }

  static async findById(id: string): Promise<InvoiceWithRelations | null> {
    return await prisma.invoice.findUnique({
      where: { id },
      include: this.includeRelations,
    })
  }

  static async findMany(
    filters: InvoiceFilters,
    page?: number,
    limit?: number
  ): Promise<{ items: InvoiceWithRelations[]; total: number }> {
    const whereClause: Prisma.InvoiceWhereInput = {}

    if (filters.subscriptionId) {
      whereClause.subscriptionId = filters.subscriptionId
    }

    if (filters.companyId) {
      whereClause.subscription = {
        companyId: filters.companyId,
      }
    }

    if (filters.status) {
      whereClause.status = filters.status
    }

    if (filters.isPaid !== undefined) {
      whereClause.paidAt = filters.isPaid ? { not: null } : null
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.periodStart = {}
      if (filters.dateFrom) {
        whereClause.periodStart.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        whereClause.periodStart.lte = filters.dateTo
      }
    }

    const offset = page && limit ? (page - 1) * limit : 0

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: page && limit ? offset : undefined,
        take: limit,
      }),
      prisma.invoice.count({ where: whereClause }),
    ])

    return { items: invoices, total }
  }

  static async create(data: Prisma.InvoiceCreateInput): Promise<InvoiceWithRelations> {
    return await prisma.invoice.create({
      data,
      include: this.includeRelations,
    })
  }

  static async update(
    id: string,
    data: Prisma.InvoiceUpdateInput
  ): Promise<InvoiceWithRelations> {
    return await prisma.invoice.update({
      where: { id },
      data,
      include: this.includeRelations,
    })
  }

  static async markAsPaid(id: string): Promise<InvoiceWithRelations> {
    return await this.update(id, {
      status: 'PAID',
      paidAt: new Date(),
    })
  }

  static async findPendingBySubscription(
    subscriptionId: string
  ): Promise<InvoiceWithRelations[]> {
    return await prisma.invoice.findMany({
      where: {
        subscriptionId,
        paidAt: null,
        status: { in: ['DRAFT', 'OPEN'] },
      },
      include: this.includeRelations,
      orderBy: { dueDate: 'asc' },
    })
  }

  static async generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Count invoices this month
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}${month}`,
        },
      },
    })

    const sequence = String(count + 1).padStart(4, '0')
    return `INV-${year}${month}-${sequence}`
  }
}
