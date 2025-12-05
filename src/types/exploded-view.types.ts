/**
 * Exploded View Types
 *
 * Tipos para el sistema de vistas explosionadas de activos
 * Permite visualizar componentes/partes de forma interactiva
 *
 * Siguiendo Next.js Expert standards:
 * - No use `any`
 * - Explicit types for all fields
 * - Proper documentation
 */

import type { PaginatedResponse } from './common.types';

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

/**
 * Tipos de hotspot soportados
 */
export type HotspotType = 'polygon' | 'circle' | 'rectangle';

/**
 * Estados posibles para vistas y componentes
 */
export type ExplodedViewStatus = 'active' | 'inactive' | 'deleted';

// ============================================================================
// COORDENADAS DE HOTSPOTS
// ============================================================================

/**
 * Punto en coordenadas 2D
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Coordenadas para hotspot tipo polígono
 */
export interface PolygonCoordinates {
  points: Point[]; // Array de puntos que forman el polígono
}

/**
 * Coordenadas para hotspot tipo círculo
 */
export interface CircleCoordinates {
  x: number;       // Centro X
  y: number;       // Centro Y
  radius: number;  // Radio del círculo
}

/**
 * Coordenadas para hotspot tipo rectángulo
 */
export interface RectangleCoordinates {
  x: number;       // Esquina superior izquierda X
  y: number;       // Esquina superior izquierda Y
  width: number;   // Ancho del rectángulo
  height: number;  // Alto del rectángulo
}

/**
 * Union type para todas las coordenadas posibles
 */
export type HotspotCoordinates =
  | PolygonCoordinates
  | CircleCoordinates
  | RectangleCoordinates;

// ============================================================================
// MODELOS PRINCIPALES
// ============================================================================

/**
 * Vista explosionada de un activo
 */
export interface AssetExplodedView {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  order: number;

  // Asset relation
  assetId: string;

  // State
  isActive: boolean;
  deletedAt: string | null;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vista explosionada con relaciones
 */
export interface AssetExplodedViewWithRelations extends AssetExplodedView {
  asset?: {
    id: string;
    name: string;
    code: string;
    manufacturer: string | null;
    model: string | null;
  };
  hotspots?: ExplodedViewHotspotWithComponent[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    hotspots: number;
  };
}

/**
 * Componente/Parte de un activo
 */
export interface ExplodedViewComponent {
  id: string;
  name: string;
  partNumber: string | null;
  description: string | null;
  manufacturer: string | null;

  // Technical specs (stored as JSON)
  specifications: Record<string, unknown> | null;

  // Documentation
  manualUrl: string | null;
  installationUrl: string | null;
  imageUrl: string | null;

  // Inventory relation
  inventoryItemId: string | null;

  // State
  isActive: boolean;
  deletedAt: string | null;

  // Audit
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Componente con relaciones
 */
export interface ExplodedViewComponentWithRelations extends ExplodedViewComponent {
  inventoryItem?: {
    id: string;
    code: string;
    name: string;
    unitCost: number | null;
    unit: string;
  };
  company?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    hotspots: number;
  };
}

/**
 * Hotspot clickeable en una vista explosionada
 */
export interface ExplodedViewHotspot {
  id: string;
  label: string;
  type: HotspotType;
  coordinates: HotspotCoordinates;
  color: string;
  opacity: number;
  order: number;

  // Relations
  viewId: string;
  componentId: string;

  // State
  isActive: boolean;
  deletedAt: string | null;

  // Audit
  createdAt: string;
  updatedAt: string;
}

/**
 * Hotspot con relación al componente
 */
export interface ExplodedViewHotspotWithComponent extends ExplodedViewHotspot {
  component: ExplodedViewComponentWithRelations;
}

// ============================================================================
// DATOS DE FORMULARIOS (React Hook Form)
// ============================================================================

/**
 * Datos para crear una vista explosionada
 */
export interface CreateExplodedViewData {
  name: string;
  description?: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  order?: number;
  assetId: string;
}

/**
 * Datos para actualizar una vista explosionada
 */
export interface UpdateExplodedViewData {
  name?: string;
  description?: string | null;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  order?: number;
  isActive?: boolean;
}

/**
 * Datos para crear un componente
 */
export interface CreateComponentData {
  name: string;
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  specifications?: Record<string, unknown>;
  manualUrl?: string;
  installationUrl?: string;
  imageUrl?: string;
  inventoryItemId?: string;
}

/**
 * Datos para actualizar un componente
 */
export interface UpdateComponentData {
  name?: string;
  partNumber?: string | null;
  description?: string | null;
  manufacturer?: string | null;
  specifications?: Record<string, unknown> | null;
  manualUrl?: string | null;
  installationUrl?: string | null;
  imageUrl?: string | null;
  inventoryItemId?: string | null;
  isActive?: boolean;
}

/**
 * Datos para crear un hotspot
 */
export interface CreateHotspotData {
  label: string;
  type: HotspotType;
  coordinates: HotspotCoordinates;
  color?: string;
  opacity?: number;
  order?: number;
  viewId: string;
  componentId: string;
}

/**
 * Datos para actualizar un hotspot
 */
export interface UpdateHotspotData {
  label?: string;
  type?: HotspotType;
  coordinates?: HotspotCoordinates;
  color?: string;
  opacity?: number;
  order?: number;
  componentId?: string;
  isActive?: boolean;
}

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

/**
 * Filtros para vistas explosionadas
 */
export interface ExplodedViewFilters {
  assetId?: string;
  search?: string;
  isActive?: boolean;
}

/**
 * Filtros para componentes
 */
export interface ComponentFilters {
  search?: string;           // Buscar en nombre, partNumber, descripción
  manufacturer?: string;
  hasInventoryItem?: boolean; // Solo componentes vinculados a inventario
  isActive?: boolean;
}

/**
 * Respuesta paginada de vistas explosionadas
 */
export type PaginatedExplodedViewsResponse = PaginatedResponse<AssetExplodedViewWithRelations>;

/**
 * Respuesta paginada de componentes
 */
export type PaginatedComponentsResponse = PaginatedResponse<ExplodedViewComponentWithRelations>;

// ============================================================================
// VIEWER (Para el componente interactivo)
// ============================================================================

/**
 * Estado del visor interactivo
 */
export interface ExplodedViewViewerState {
  scale: number;           // Zoom level (1 = 100%)
  offsetX: number;         // Pan horizontal
  offsetY: number;         // Pan vertical
  selectedHotspotId: string | null;
  hoveredHotspotId: string | null;
}

/**
 * Configuración del visor
 */
export interface ExplodedViewViewerConfig {
  minScale: number;        // Zoom mínimo (ej: 0.5 = 50%)
  maxScale: number;        // Zoom máximo (ej: 3 = 300%)
  zoomStep: number;        // Incremento de zoom (ej: 0.1)
  enablePan: boolean;      // Permitir pan/arrastre
  enableZoom: boolean;     // Permitir zoom
  showLabels: boolean;     // Mostrar labels de hotspots
  interactive: boolean;    // Permitir clicks en hotspots
}

/**
 * Props para el componente viewer
 */
export interface ExplodedViewViewerProps {
  view: AssetExplodedViewWithRelations;
  config?: Partial<ExplodedViewViewerConfig>;
  onHotspotClick?: (hotspot: ExplodedViewHotspotWithComponent) => void;
  onHotspotHover?: (hotspot: ExplodedViewHotspotWithComponent | null) => void;
  className?: string;
}

// ============================================================================
// EDITOR (Para el modo de edición/creación de hotspots)
// ============================================================================

/**
 * Modo del editor de hotspots
 */
export type HotspotEditorMode =
  | 'view'       // Solo visualización
  | 'select'     // Seleccionar hotspots existentes
  | 'polygon'    // Dibujar polígono
  | 'circle'     // Dibujar círculo
  | 'rectangle'; // Dibujar rectángulo

/**
 * Estado del editor de hotspots
 */
export interface HotspotEditorState {
  mode: HotspotEditorMode;
  currentHotspot: Partial<ExplodedViewHotspot> | null;
  tempPoints: Point[];     // Puntos temporales mientras se dibuja
  selectedHotspotId: string | null;
}

/**
 * Props para el componente editor
 */
export interface HotspotEditorProps {
  viewId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  hotspots: ExplodedViewHotspot[];
  components: ExplodedViewComponent[];
  onSave: (hotspot: CreateHotspotData) => Promise<void>;
  onUpdate: (id: string, data: UpdateHotspotData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
}

// ============================================================================
// INFORMACIÓN EXTENDIDA DE COMPONENTE (Para el panel de detalles)
// ============================================================================

/**
 * Información completa de un componente para mostrar en el detalle
 */
export interface ComponentDetailInfo extends ExplodedViewComponentWithRelations {
  // Stock information (if linked to inventory)
  stockInfo?: {
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    locations: Array<{
      locationName: string;
      quantity: number;
    }>;
  };

  // Work order history
  workOrderHistory?: Array<{
    id: string;
    number: string;
    title: string;
    type: string;
    completedAt: string | null;
  }>;

  // Related components (same asset)
  relatedComponents?: ExplodedViewComponent[];
}

// ============================================================================
// ANALYTICS (Opcional - para futuras fases)
// ============================================================================

/**
 * Estadísticas de uso de componentes
 */
export interface ComponentUsageStats {
  componentId: string;
  componentName: string;
  partNumber: string | null;

  // Usage metrics
  totalWorkOrders: number;
  totalReplacements: number;
  avgReplacementCost: number | null;
  lastReplacementDate: string | null;

  // Failure analysis
  mtbf: number | null; // Mean Time Between Failures (hours)
  failureRate: number | null; // Failures per year
}

/**
 * Respuesta de analytics de componentes
 */
export interface ComponentAnalyticsResponse {
  assetId: string;
  assetName: string;
  period: {
    start: string;
    end: string;
  };
  components: ComponentUsageStats[];
}
