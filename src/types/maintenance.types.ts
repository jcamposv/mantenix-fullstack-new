/**
 * Maintenance Management Types
 *
 * TypeScript types for ISO 14224 maintenance management system
 * Includes types for MaintenancePlan, MaintenanceTask, and related entities
 */

import type {
  MaintenancePlan,
  MaintenanceTask,
  MaintenanceType,
  FrequencyUnit,
  ComponentCriticality,
  ExplodedViewComponent,
} from '@prisma/client'

// ============================================================================
// MAINTENANCE PLAN TYPES
// ============================================================================

/**
 * Maintenance Plan with all relations
 */
export type MaintenancePlanWithRelations = MaintenancePlan & {
  component: ExplodedViewComponent
  tasks: MaintenanceTask[]
}

/**
 * Maintenance Plan with component and task count
 */
export type MaintenancePlanWithCounts = MaintenancePlan & {
  component: ExplodedViewComponent
  _count: {
    tasks: number
  }
}

/**
 * Maintenance Plan summary for list views
 */
export type MaintenancePlanSummary = Pick<
  MaintenancePlan,
  'id' | 'name' | 'type' | 'frequencyValue' | 'frequencyUnit' | 'nextScheduledAt' | 'isActive'
> & {
  component: Pick<ExplodedViewComponent, 'id' | 'name' | 'partNumber'>
  taskCount: number
}

// ============================================================================
// MAINTENANCE TASK TYPES
// ============================================================================

/**
 * Maintenance Task with all relations
 */
export type MaintenanceTaskWithRelations = MaintenanceTask & {
  plan: MaintenancePlan
}

/**
 * Maintenance Task summary for list views
 */
export type MaintenanceTaskSummary = Pick<
  MaintenanceTask,
  | 'id'
  | 'title'
  | 'order'
  | 'estimatedDuration'
  | 'requiresPhotoBefore'
  | 'requiresPhotoAfter'
  | 'requiresMeasurement'
  | 'isActive'
>

// ============================================================================
// COMPONENT HIERARCHY TYPES
// ============================================================================

/**
 * Component with hierarchy information
 */
export type ComponentWithHierarchy = ExplodedViewComponent & {
  parentComponent?: ExplodedViewComponent | null
  childComponents: ExplodedViewComponent[]
  maintenancePlans: MaintenancePlan[]
}

/**
 * Component tree node for hierarchical display
 */
export type ComponentTreeNode = {
  id: string
  name: string
  partNumber: string | null
  hierarchyLevel: number
  criticality: ComponentCriticality | null
  children: ComponentTreeNode[]
  maintenancePlanCount: number
}

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

/**
 * Paginated Maintenance Plans response
 */
export type PaginatedMaintenancePlansResponse = {
  items: MaintenancePlanWithCounts[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated Maintenance Tasks response
 */
export type PaginatedMaintenanceTasksResponse = {
  items: MaintenanceTaskWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// FILTERS
// ============================================================================

/**
 * Maintenance Plan filters
 */
export type MaintenancePlanFilters = {
  componentId?: string
  type?: MaintenanceType
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Maintenance Task filters
 */
export type MaintenanceTaskFilters = {
  planId?: string
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Component hierarchy filters
 */
export type ComponentHierarchyFilters = {
  parentComponentId?: string | null
  hierarchyLevel?: number
  criticality?: ComponentCriticality
  isActive?: boolean
  search?: string
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Maintenance Plan statistics
 */
export type MaintenancePlanStats = {
  totalPlans: number
  activeePlans: number
  plansByType: Record<MaintenanceType, number>
  averageExecutions: number
  averageFailureRate: number
}

/**
 * Component maintenance statistics
 */
export type ComponentMaintenanceStats = {
  componentId: string
  componentName: string
  totalPlans: number
  upcomingMaintenance: number
  overdueMaintenance: number
  mtbf: number | null
  mttr: number | null
  criticality: ComponentCriticality | null
}

// ============================================================================
// MAINTENANCE EXECUTION (future implementation)
// ============================================================================

/**
 * Maintenance execution record (will be linked to WorkOrders)
 */
export type MaintenanceExecution = {
  id: string
  planId: string
  workOrderId: string
  executedAt: Date
  duration: number
  completedTasks: number
  totalTasks: number
  foundIssues: boolean
  notes: string | null
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form data for creating/updating maintenance plan
 */
export type MaintenancePlanFormData = {
  name: string
  description?: string | null
  type: MaintenanceType
  frequencyValue: number
  frequencyUnit: FrequencyUnit
  componentId: string
  estimatedDuration?: number | null
  estimatedCost?: number | null
  requiredTools?: string[]
  requiredMaterials?: string[]
  safetyNotes?: string | null
}

/**
 * Form data for creating/updating maintenance task
 */
export type MaintenanceTaskFormData = {
  title: string
  description?: string | null
  instructions?: string | null
  order: number
  estimatedDuration?: number | null
  requiresPhotoBefore?: boolean
  requiresPhotoAfter?: boolean
  requiresMeasurement?: boolean
  measurementUnit?: string | null
  acceptanceCriteria?: string | null
  planId: string
}

/**
 * Form data for component hierarchy and technical specs
 */
export type ComponentTechnicalFormData = {
  parentComponentId?: string | null
  hierarchyLevel: number
  criticality?: ComponentCriticality | null
  lifeExpectancy?: number | null
  mtbf?: number | null
  mttr?: number | null
}
