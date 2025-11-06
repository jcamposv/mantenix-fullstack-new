import { Prisma } from "@prisma/client"
import { UserRepository } from "../repositories/user.repository"
import { CompanyRepository } from "../repositories/company.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { UserFilters, PaginatedUsersResponse, UserWithRelations } from "@/types/user.types"
import type { CreateUserInput, UpdateUserInput } from "../../app/api/schemas/user-schemas"

/**
 * Servicio de lógica de negocio para usuarios
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class UserService {
  
  /**
   * Construye el WHERE clause para filtrar usuarios según el rol del usuario
   */
  static buildWhereClause(session: AuthenticatedSession, userId?: string, filters?: UserFilters): Prisma.UserWhereInput {
    const whereClause: Prisma.UserWhereInput = userId ? { id: userId } : {}

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todos los usuarios
    } else if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Admin empresa/grupo puede ver usuarios de su empresa y clientes
      whereClause.OR = [
        { companyId: session.user.companyId },
        {
          clientCompany: {
            tenantCompanyId: session.user.companyId
          }
        }
      ]
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      // Admin general cliente solo puede ver usuarios de su empresa cliente
      whereClause.clientCompanyId = session.user.clientCompanyId
    } else {
      throw new Error("Rol no autorizado para gestionar usuarios")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.role) whereClause.role = filters.role
      if (filters.companyId) whereClause.companyId = filters.companyId
      if (filters.clientCompanyId) whereClause.clientCompanyId = filters.clientCompanyId
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    return whereClause
  }

  /**
   * Obtiene un usuario por ID verificando permisos
   */
  static async getById(userId: string, session: AuthenticatedSession): Promise<UserWithRelations | null> {
    const whereClause = this.buildWhereClause(session, userId)
    return await UserRepository.findFirst(whereClause)
  }

  /**
   * Obtiene lista paginada de usuarios
   */
  static async getList(session: AuthenticatedSession, filters: UserFilters, page: number, limit: number): Promise<PaginatedUsersResponse> {
    // Verificar permisos
    const hasPermission = AuthService.canUserPerformAction(session.user.role, 'view_all_users') ||
                         AuthService.canUserPerformAction(session.user.role, 'view_company_users') ||
                         AuthService.canUserPerformAction(session.user.role, 'view_client_users')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver usuarios")
    }

    const whereClause = this.buildWhereClause(session, undefined, filters)
    const { users, total } = await UserRepository.findMany(whereClause, page, limit)

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async create(userData: CreateUserInput & { password?: string }, session: AuthenticatedSession): Promise<UserWithRelations> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'create_user')) {
      throw new Error("No tienes permisos para crear usuarios")
    }

    // Verificar que no existe un usuario con el mismo email
    const existingUser = await UserRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error("Ya existe un usuario con este email")
    }

    // Validar relaciones según el rol del usuario que crea
    await this.validateUserRelations(userData, session)

    // Obtener companyGroupId si el usuario tiene una companyId
    let companyGroupId: string | null = null
    if (userData.companyId) {
      companyGroupId = await CompanyRepository.getCompanyGroupId(userData.companyId)
    }

    // Preparar datos para crear
    const createData: Prisma.UserCreateInput = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      image: userData.image
    }

    // Conectar relaciones opcionales
    if (userData.companyId) {
      createData.company = { connect: { id: userData.companyId } }

      // Conectar companyGroup si existe
      if (companyGroupId) {
        createData.companyGroup = { connect: { id: companyGroupId } }
      }
    }
    if (userData.clientCompanyId) {
      createData.clientCompany = { connect: { id: userData.clientCompanyId } }
    }
    if (userData.siteId) {
      createData.site = { connect: { id: userData.siteId } }
    }

    return await UserRepository.create(createData)
  }

  /**
   * Actualiza un usuario
   */
  static async update(id: string, userData: UpdateUserInput, session: AuthenticatedSession): Promise<UserWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'update_user')) {
      throw new Error("No tienes permisos para actualizar usuarios")
    }

    // Verificar que el usuario existe y se tiene acceso
    const existingUser = await this.getById(id, session)
    if (!existingUser) {
      return null
    }

    // Si se cambia el email, verificar que no exista otro usuario con ese email
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await UserRepository.findByEmail(userData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error("Ya existe un usuario con este email")
      }
    }

    // Validar relaciones si se están cambiando
    if (userData.companyId || userData.clientCompanyId || userData.siteId) {
      await this.validateUserRelations(userData, session)
    }

    // Obtener companyGroupId si se está actualizando companyId
    let companyGroupId: string | null | undefined = undefined
    if (userData.companyId !== undefined) {
      if (userData.companyId) {
        companyGroupId = await CompanyRepository.getCompanyGroupId(userData.companyId)
      } else {
        companyGroupId = null
      }
    }

    // Preparar datos para actualizar
    const updateData: Prisma.UserUpdateInput = {
      name: userData.name,
      email: userData.email,
      role: userData.role
    }

    // Solo actualizar image si fue proporcionado explícitamente
    if (userData.image !== undefined) {
      updateData.image = userData.image
    }

    // Actualizar relaciones opcionales
    if (userData.companyId !== undefined) {
      updateData.company = userData.companyId ? { connect: { id: userData.companyId } } : { disconnect: true }

      // Actualizar companyGroupId cuando cambia la companyId
      if (companyGroupId !== undefined) {
        if (companyGroupId) {
          updateData.companyGroup = { connect: { id: companyGroupId } }
        } else {
          updateData.companyGroup = { disconnect: true }
        }
      }
    }
    if (userData.clientCompanyId !== undefined) {
      updateData.clientCompany = userData.clientCompanyId ? { connect: { id: userData.clientCompanyId } } : { disconnect: true }
    }
    if (userData.siteId !== undefined) {
      updateData.site = userData.siteId ? { connect: { id: userData.siteId } } : { disconnect: true }
    }

    return await UserRepository.update(id, updateData)
  }

  /**
   * Elimina un usuario
   */
  static async delete(id: string, session: AuthenticatedSession): Promise<UserWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'delete_user')) {
      throw new Error("No tienes permisos para eliminar usuarios")
    }

    // Verificar que el usuario existe y se tiene acceso
    const existingUser = await this.getById(id, session)
    if (!existingUser) {
      return null
    }

    // No permitir eliminar el propio usuario
    if (existingUser.id === session.user.id) {
      throw new Error("No puedes eliminar tu propio usuario")
    }

    return await UserRepository.delete(id)
  }

  /**
   * Obtiene todos los usuarios (solo para super admin)
   */
  static async getAllUsers(): Promise<UserWithRelations[]> {
    return await UserRepository.findAllWithRelations()
  }

  /**
   * Obtiene el perfil de un usuario con información extendida
   */
  static async getProfile(userId: string): Promise<UserWithRelations | null> {
    return await UserRepository.findById(userId)
  }

  /**
   * Valida las relaciones del usuario según el rol del usuario que está creando/actualizando
   */
  private static async validateUserRelations(userData: Partial<CreateUserInput | UpdateUserInput>, session: AuthenticatedSession): Promise<void> {
    // Los super admin pueden asignar cualquier relación
    if (session.user.role === "SUPER_ADMIN") {
      return
    }

    // Los admin empresa/grupo solo pueden crear usuarios en su empresa o empresas cliente
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (userData.companyId && userData.companyId !== session.user.companyId) {
        throw new Error("No puedes asignar usuarios a otras empresas")
      }
      // TODO: Validar que clientCompanyId pertenezca a la empresa del admin
    }

    // Los admin cliente general solo pueden crear usuarios en su empresa cliente
    if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (userData.clientCompanyId && userData.clientCompanyId !== session.user.clientCompanyId) {
        throw new Error("No puedes asignar usuarios a otras empresas cliente")
      }
      if (userData.companyId) {
        throw new Error("No puedes asignar usuarios a empresas de mantenimiento")
      }
    }
  }
}