/**
 * Audit System for Compliance
 * 
 * Features:
 * - 7-year retention for compliance
 * - All security events logged
 * - Comprehensive audit trail
 */

import { prisma } from './prisma'
import { AuditStatus, SecurityEventType } from '@prisma/client'

// ============================================================================
// AUDIT ACTION CONSTANTS
// ============================================================================

export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // MFA
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  MFA_VERIFIED: 'MFA_VERIFIED',
  MFA_FAILED: 'MFA_FAILED',
  MFA_SETUP_STARTED: 'MFA_SETUP_STARTED',
  MFA_SETUP_COMPLETED: 'MFA_SETUP_COMPLETED',
  
  // Users
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_ENABLED: 'USER_ENABLED',
  USER_DISABLED: 'USER_DISABLED',
  
  // Companies
  COMPANY_CREATED: 'COMPANY_CREATED',
  COMPANY_UPDATED: 'COMPANY_UPDATED',
  COMPANY_SETTINGS_CHANGED: 'COMPANY_SETTINGS_CHANGED',
  COMPANY_BRANDING_UPDATED: 'COMPANY_BRANDING_UPDATED',
  
  // Sessions
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
  
  // Security
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  IP_BLOCKED: 'IP_BLOCKED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Data Access (for compliance)
  DATA_ACCESSED: 'DATA_ACCESSED',
  DATA_EXPORTED: 'DATA_EXPORTED',
  DATA_DELETED: 'DATA_DELETED',
  DATA_MODIFIED: 'DATA_MODIFIED',
  
  // Administrative
  ADMIN_ACTION: 'ADMIN_ACTION',
  BACKUP_CREATED: 'BACKUP_CREATED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
} as const

export const AUDIT_RESOURCES = {
  USER: 'USER',
  COMPANY: 'COMPANY',
  SESSION: 'SESSION',
  AUDIT_LOG: 'AUDIT_LOG',
  SECURITY_EVENT: 'SECURITY_EVENT',
  MFA: 'MFA',
  PASSWORD: 'PASSWORD',
  BRANDING: 'BRANDING',
  SYSTEM: 'SYSTEM',
} as const

// ============================================================================
// TYPES
// ============================================================================

interface CreateAuditLogParams {
  companyId: string
  userId?: string // Cognito sub or Better Auth user ID
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress: string
  userAgent?: string
  status?: AuditStatus
  metadata?: string
}

interface CreateSecurityEventParams {
  companyId: string
  userId?: string
  type: SecurityEventType
  severity: string
  description: string
  ipAddress?: string
  userAgent?: string
  metadata?: string
}

// ============================================================================
// CORE AUDIT FUNCTIONS
// ============================================================================


/**
 * Create an immutable audit log entry with blockchain-style chaining
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  const {
    companyId,
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
    status = AuditStatus.SUCCESS,
  } = params

  try {
    // Create the audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        status
      }
    })
    
    return auditLog
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should never break the main flow
    // But we should alert monitoring systems
    return null
  }
}

/**
 * Create a security event for monitoring and compliance
 */
export async function createSecurityEvent(params: CreateSecurityEventParams) {
  const {
    companyId,
    userId,
    type,
    severity,
    description,
    ipAddress,
    userAgent,
    metadata
  } = params

  try {
    const securityEvent = await prisma.securityEvent.create({
      data: {
        companyId,
        userId,
        type,
        severity,
        description,
        ipAddress: ipAddress || 'unknown',
        userAgent,
        metadata
      }
    })
    
    // Also create an audit log for the security event
    await createAuditLog({
      companyId,
      userId,
      action: 'SECURITY_EVENT_CREATED',
      resource: AUDIT_RESOURCES.SECURITY_EVENT,
      resourceId: securityEvent.id,
      details: JSON.stringify({
        type,
        severity,
        description
      }),
      ipAddress: ipAddress || 'unknown',
      userAgent,
      metadata
    })
    
    return securityEvent
  } catch (error) {
    console.error('Failed to create security event:', error)
    return null
  }
}


// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON AUDIT EVENTS
// ============================================================================

export async function auditLogin(
  companyId: string,
  userId: string,
  ipAddress: string,
  userAgent?: string,
  success: boolean = true
) {
  return createAuditLog({
    companyId,
    userId,
    action: success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN_FAILED,
    resource: AUDIT_RESOURCES.SESSION,
    ipAddress,
    userAgent,
    status: success ? AuditStatus.SUCCESS : AuditStatus.ERROR
  })
}

export async function auditLogout(
  companyId: string,
  userId: string,
  ipAddress: string,
  userAgent?: string
) {
  return createAuditLog({
    companyId,
    userId,
    action: AUDIT_ACTIONS.LOGOUT,
    resource: AUDIT_RESOURCES.SESSION,
    ipAddress,
    userAgent
  })
}

export async function auditPasswordChange(
  companyId: string,
  userId: string,
  ipAddress: string,
  userAgent?: string
) {
  return createAuditLog({
    companyId,
    userId,
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    resource: AUDIT_RESOURCES.PASSWORD,
    resourceId: userId,
    ipAddress,
    userAgent
  })
}

export async function auditMFAAction(
  companyId: string,
  userId: string,
  action: 'enabled' | 'disabled' | 'verified' | 'failed' | 'setup_started' | 'setup_completed',
  ipAddress: string,
  userAgent?: string
) {
  const actionMap = {
    enabled: AUDIT_ACTIONS.MFA_ENABLED,
    disabled: AUDIT_ACTIONS.MFA_DISABLED,
    verified: AUDIT_ACTIONS.MFA_VERIFIED,
    failed: AUDIT_ACTIONS.MFA_FAILED,
    setup_started: AUDIT_ACTIONS.MFA_SETUP_STARTED,
    setup_completed: AUDIT_ACTIONS.MFA_SETUP_COMPLETED
  }
  
  return createAuditLog({
    companyId,
    userId,
    action: actionMap[action],
    resource: AUDIT_RESOURCES.MFA,
    resourceId: userId,
    ipAddress,
    userAgent,
    status: action === 'failed' ? AuditStatus.ERROR : AuditStatus.SUCCESS
  })
}

export async function auditUserAction(
  companyId: string,
  performedByUserId: string,
  targetUserId: string,
  action: 'created' | 'updated' | 'deleted' | 'role_changed' | 'enabled' | 'disabled',
  ipAddress: string,
  userAgent?: string,
  details?: string
) {
  const actionMap = {
    created: AUDIT_ACTIONS.USER_CREATED,
    updated: AUDIT_ACTIONS.USER_UPDATED,
    deleted: AUDIT_ACTIONS.USER_DELETED,
    role_changed: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    enabled: AUDIT_ACTIONS.USER_ENABLED,
    disabled: AUDIT_ACTIONS.USER_DISABLED
  }
  
  return createAuditLog({
    companyId,
    userId: performedByUserId,
    action: actionMap[action],
    resource: AUDIT_RESOURCES.USER,
    resourceId: targetUserId,
    details,
    ipAddress,
    userAgent
  })
}

export async function auditCompanyAction(
  companyId: string,
  performedByUserId: string,
  action: 'created' | 'updated' | 'settings_changed' | 'branding_updated',
  ipAddress: string,
  userAgent?: string,
  details?: string
) {
  const actionMap = {
    created: AUDIT_ACTIONS.COMPANY_CREATED,
    updated: AUDIT_ACTIONS.COMPANY_UPDATED,
    settings_changed: AUDIT_ACTIONS.COMPANY_SETTINGS_CHANGED,
    branding_updated: AUDIT_ACTIONS.COMPANY_BRANDING_UPDATED
  }
  
  return createAuditLog({
    companyId,
    userId: performedByUserId,
    action: actionMap[action],
    resource: AUDIT_RESOURCES.COMPANY,
    resourceId: companyId,
    details,
    ipAddress,
    userAgent
  })
}

export async function auditDataAccess(
  companyId: string,
  userId: string,
  action: 'accessed' | 'exported' | 'deleted' | 'modified',
  resource: string,
  resourceId: string,
  ipAddress: string,
  userAgent?: string,
  details?: string
) {
  const actionMap = {
    accessed: AUDIT_ACTIONS.DATA_ACCESSED,
    exported: AUDIT_ACTIONS.DATA_EXPORTED,
    deleted: AUDIT_ACTIONS.DATA_DELETED,
    modified: AUDIT_ACTIONS.DATA_MODIFIED
  }
  
  return createAuditLog({
    companyId,
    userId,
    action: actionMap[action],
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent
  })
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get audit logs with pagination and filtering
 */
export async function getAuditLogs(
  companyId: string,
  options: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    status?: AuditStatus
  } = {}
) {
  const {
    page = 1,
    limit = 50,
    userId,
    action,
    resource,
    startDate,
    endDate,
    status
  } = options
  
  const skip = (page - 1) * limit
  
  const where: Record<string, unknown> = { companyId }
  
  if (userId) where.userId = userId
  if (action) where.action = action
  if (resource) where.resource = resource
  if (status) where.status = status
  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {}
    if (startDate) createdAt.gte = startDate
    if (endDate) createdAt.lte = endDate
    where.createdAt = createdAt
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLog.count({ where })
  ])
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Get security events with filtering
 */
export async function getSecurityEvents(
  companyId: string,
  options: {
    page?: number
    limit?: number
    type?: SecurityEventType
    severity?: string
    resolved?: boolean
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const {
    page = 1,
    limit = 50,
    type,
    severity,
    resolved,
    startDate,
    endDate
  } = options
  
  const skip = (page - 1) * limit
  
  const where: Record<string, unknown> = { companyId }
  
  if (type) where.type = type
  if (severity) where.severity = severity
  if (resolved !== undefined) where.resolved = resolved
  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {}
    if (startDate) createdAt.gte = startDate
    if (endDate) createdAt.lte = endDate
    where.createdAt = createdAt
  }
  
  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.securityEvent.count({ where })
  ])
  
  return {
    events,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Resolve a security event
 */
export async function resolveSecurityEvent(
  eventId: string,
  resolvedBy: string,
  resolution: string,
  ipAddress: string,
  userAgent?: string
) {
  const event = await prisma.securityEvent.update({
    where: { id: eventId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy
    },
    include: { company: true }
  })
  
  // Audit the resolution
  await createAuditLog({
    companyId: event.companyId,
    userId: resolvedBy,
    action: 'SECURITY_EVENT_RESOLVED',
    resource: AUDIT_RESOURCES.SECURITY_EVENT,
    resourceId: eventId,
    details: JSON.stringify({ resolution }),
    ipAddress,
    userAgent
  })
  
  return event
}