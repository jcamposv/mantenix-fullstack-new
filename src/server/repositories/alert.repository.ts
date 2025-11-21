import { Prisma, AlertStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { AlertWithRelations } from "@/types/alert.types"

/**
 * Repository para el acceso a datos de alertas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class AlertRepository {
  static async findById(id: string): Promise<AlertWithRelations | null> {
    return await prisma.alert.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                roleId: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
  }

  static async findFirst(whereClause: Prisma.AlertWhereInput): Promise<AlertWithRelations | null> {
    return await prisma.alert.findFirst({
      where: whereClause,
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                roleId: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
  }

  static async findMany(whereClause: Prisma.AlertWhereInput, page: number, limit: number): Promise<{ items: AlertWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: whereClause,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              clientCompany: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              roleId: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              roleId: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { reportedAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.alert.count({ where: whereClause })
    ])

    return { items: alerts, total }
  }

  static async create(data: Prisma.AlertCreateInput): Promise<AlertWithRelations> {
    const alert = await prisma.alert.create({
      data: {
        ...data,
        reportedAt: new Date(),
        status: AlertStatus.OPEN
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        }
      }
    })
    
    return alert as AlertWithRelations
  }

  static async update(id: string, data: Prisma.AlertUpdateInput): Promise<AlertWithRelations> {
    return await prisma.alert.update({
      where: { id },
      data,
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        }
      }
    })
  }

  static async delete(id: string): Promise<AlertWithRelations> {
    return await prisma.alert.delete({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true
          }
        }
      }
    })
  }
}