// Services
export { AuthService } from './services/auth.service'
export { AlertService } from './services/alert.service'
export { CommentService } from './services/comment.service'
export { UserService } from './services/user.service'
export { NotificationService } from './services/notification.service'
export { ClientCompanyService } from './services/client-company.service'

// Repositories
export { AlertRepository } from './repositories/alert.repository'
export { CommentRepository } from './repositories/comment.repository'
export { UserRepository } from './repositories/user.repository'
export { ClientCompanyRepository } from './repositories/client-company.repository'

// Helpers
export { PermissionHelper } from './helpers/permission.helper'

// Re-export types from the main types folder
export type { AuthenticatedSession, User } from '@/types/auth.types'
export type { AlertWithRelations, AlertFilters, PaginatedAlertsResponse, CreateAlertData, UpdateAlertData } from '@/types/alert.types'
export type { CommentWithAuthor, CreateCommentData } from '@/types/comment.types'
export type { UserWithRelations, UserFilters, PaginatedUsersResponse, CreateUserData, UpdateUserData } from '@/types/user.types'
export type { ClientCompanyWithRelations, ClientCompanyFilters, PaginatedClientCompaniesResponse, CreateClientCompanyData, UpdateClientCompanyData } from '@/types/client-company.types'

// Re-export schemas
export { createUserSchema, updateUserSchema, userFiltersSchema } from '@/app/api/schemas/user-schemas'
export { createClientCompanySchema, updateClientCompanySchema, clientCompanyFiltersSchema } from '@/app/api/schemas/client-company-schemas'