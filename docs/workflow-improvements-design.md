# Workflow Improvements Design
## Mejoras Críticas para Cumplimiento Industrial y OSHA

### 1. APPROVAL WORKFLOW (Workflow de Aprobación Multinivel)

#### Objetivo
Implementar aprobaciones basadas en costo/criticidad antes de ejecutar órdenes de trabajo.

#### Workflow Propuesto
```
DRAFT → PENDING_APPROVAL → APPROVED → ASSIGNED → IN_PROGRESS → PENDING_QA → COMPLETED
         ↓                    ↓
      REJECTED            REJECTED
```

#### Nuevos Estados WorkOrderStatus
- `PENDING_APPROVAL` - Esperando aprobación de supervisor/manager
- `APPROVED` - Aprobada, lista para asignar
- `REJECTED` - Rechazada, requiere modificación
- `PENDING_QA` - Completada, esperando QA sign-off

#### Schema: WorkOrderApproval
```prisma
model WorkOrderApproval {
  id            String   @id @default(cuid())
  workOrderId   String
  level         Int      // 1 = Supervisor, 2 = Manager, 3 = Director
  approverId    String?  // Usuario que debe aprobar
  approvedBy    String?  // Usuario que aprobó
  status        ApprovalStatus
  comments      String?
  requiredCost  Float?   // Costo estimado que dispara esta aprobación
  approvedAt    DateTime?
  rejectedAt    DateTime?
  createdAt     DateTime @default(now())

  workOrder     WorkOrder @relation(fields: [workOrderId], references: [id])
  approver      User?     @relation("ApprovalApprover", fields: [approverId], references: [id])
  approvedByUser User?    @relation("ApprovalApprovedBy", fields: [approvedBy], references: [id])
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Schema: ApprovalRule (Configuración de umbrales)
```prisma
model ApprovalRule {
  id              String  @id @default(cuid())
  companyId       String
  name            String
  description     String?
  minCost         Float?  // Costo mínimo para activar
  maxCost         Float?  // Costo máximo
  priority        WorkOrderPriority? // Prioridad que activa
  type            WorkOrderType?     // Tipo de OT que activa
  assetCriticality ComponentCriticality? // Criticidad del activo
  approvalLevels  Int     // Niveles de aprobación requeridos
  isActive        Boolean @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])
}
```

---

### 2. SAFETY INTEGRATION (Integración de Seguridad OSHA)

#### Objetivo
Cumplir con normas OSHA mediante tracking de permisos, LOTO y análisis de seguridad.

#### A. Work Permits (Permisos de Trabajo)

##### Schema: WorkPermit
```prisma
model WorkPermit {
  id              String   @id @default(cuid())
  workOrderId     String
  permitType      PermitType
  issuedBy        String   // Usuario que emite
  authorizedBy    String?  // Usuario que autoriza
  status          PermitStatus
  validFrom       DateTime
  validUntil      DateTime
  location        String   // Ubicación específica
  hazards         String[] // Lista de riesgos identificados
  precautions     String[] // Precauciones requeridas
  ppe             String[] // EPP requerido
  emergencyContact String?
  issuedAt        DateTime?
  authorizedAt    DateTime?
  closedAt        DateTime?
  createdAt       DateTime @default(now())

  workOrder       WorkOrder @relation(fields: [workOrderId], references: [id])
  issuer          User @relation("PermitIssuer", fields: [issuedBy], references: [id])
  authorizer      User? @relation("PermitAuthorizer", fields: [authorizedBy], references: [id])
}

enum PermitType {
  HOT_WORK          // Trabajo en caliente (soldadura, corte)
  CONFINED_SPACE    // Espacio confinado
  ELECTRICAL        // Trabajo eléctrico
  HEIGHT_WORK       // Trabajo en altura
  EXCAVATION        // Excavación
  CHEMICAL          // Manejo de químicos
  RADIATION         // Trabajo con radiación
  GENERAL           // Permiso general
}

enum PermitStatus {
  DRAFT
  PENDING_AUTHORIZATION
  ACTIVE
  SUSPENDED
  CLOSED
  EXPIRED
}
```

#### B. LOTO Tracking (Lock-Out/Tag-Out)

##### Schema: LOTOProcedure
```prisma
model LOTOProcedure {
  id              String   @id @default(cuid())
  workOrderId     String
  assetId         String
  authorizedBy    String   // Usuario autorizado
  status          LOTOStatus
  isolationPoints String[] // Puntos de aislamiento
  energySources   String[] // Fuentes de energía aisladas
  lockSerialNumbers String[] // Números de serie de candados
  tagNumbers      String[] // Números de etiquetas
  verifiedBy      String?  // Usuario que verifica
  appliedAt       DateTime?
  verifiedAt      DateTime?
  removedAt       DateTime?
  removalAuthorizedBy String?
  createdAt       DateTime @default(now())

  workOrder       WorkOrder @relation(fields: [workOrderId], references: [id])
  asset           Asset @relation(fields: [assetId], references: [id])
  authorized      User @relation("LOTOAuthorized", fields: [authorizedBy], references: [id])
  verifier        User? @relation("LOTOVerifier", fields: [verifiedBy], references: [id])
  removalAuthorizer User? @relation("LOTORemovalAuthorizer", fields: [removalAuthorizedBy], references: [id])
}

enum LOTOStatus {
  PENDING
  APPLIED
  VERIFIED
  REMOVED
}
```

#### C. Job Safety Analysis (JSA)

##### Schema: JobSafetyAnalysis
```prisma
model JobSafetyAnalysis {
  id              String   @id @default(cuid())
  workOrderId     String
  preparedBy      String
  reviewedBy      String?
  approvedBy      String?
  status          JSAStatus
  jobSteps        Json     // Array de pasos del trabajo
  hazardsPerStep  Json     // Riesgos por paso
  controlsPerStep Json     // Controles por paso
  preparedAt      DateTime?
  reviewedAt      DateTime?
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  workOrder       WorkOrder @relation(fields: [workOrderId], references: [id])
  preparer        User @relation("JSAPreparer", fields: [preparedBy], references: [id])
  reviewer        User? @relation("JSAReviewer", fields: [reviewedBy], references: [id])
  approver        User? @relation("JSAApprover", fields: [approvedBy], references: [id])
}

enum JSAStatus {
  DRAFT
  PENDING_REVIEW
  PENDING_APPROVAL
  APPROVED
  REJECTED
}
```

---

### 3. ROOT CAUSE ANALYSIS (Análisis de Causa Raíz)

#### Objetivo
Implementar metodologías de RCA para prevenir recurrencia de fallas.

#### A. 5-Why Analysis

##### Schema: RootCauseAnalysis
```prisma
model RootCauseAnalysis {
  id              String   @id @default(cuid())
  workOrderId     String
  assetId         String?
  analysisType    RCAType
  failureMode     String   // Modo de falla observado
  immediateSymptom String  // Síntoma inmediato

  // 5-Why Analysis
  why1            String?
  why2            String?
  why3            String?
  why4            String?
  why5            String?
  rootCause       String?  // Causa raíz identificada

  // Fishbone/Ishikawa (stored as JSON)
  fishboneData    Json?    // Categories: Man, Machine, Material, Method, Environment, Management

  // CAPA (Corrective and Preventive Actions)
  correctiveActions Json?  // Array de acciones correctivas
  preventiveActions Json?  // Array de acciones preventivas

  analyzedBy      String
  reviewedBy      String?
  status          RCAStatus
  analyzedAt      DateTime?
  reviewedAt      DateTime?
  implementedAt   DateTime?
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  workOrder       WorkOrder @relation(fields: [workOrderId], references: [id])
  asset           Asset? @relation(fields: [assetId], references: [id])
  analyzer        User @relation("RCAAnalyzer", fields: [analyzedBy], references: [id])
  reviewer        User? @relation("RCAReviewer", fields: [reviewedBy], references: [id])
}

enum RCAType {
  FIVE_WHY
  FISHBONE
  FAULT_TREE
  PARETO
}

enum RCAStatus {
  DRAFT
  IN_ANALYSIS
  PENDING_REVIEW
  APPROVED
  IMPLEMENTING
  IMPLEMENTED
  VERIFIED
}
```

#### B. CAPA Tracking (Corrective/Preventive Actions)

##### Schema: CAPAction
```prisma
model CAPAction {
  id              String   @id @default(cuid())
  rcaId           String
  actionType      ActionType
  description     String
  assignedTo      String
  priority        WorkOrderPriority
  status          CAPStatus
  dueDate         DateTime?
  completedAt     DateTime?
  verifiedAt      DateTime?
  verifiedBy      String?
  effectiveness   Int?     // 1-5 rating después de implementar
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  rca             RootCauseAnalysis @relation(fields: [rcaId], references: [id])
  assigned        User @relation("CAPAssigned", fields: [assignedTo], references: [id])
  verifier        User? @relation("CAPVerifier", fields: [verifiedBy], references: [id])
}

enum ActionType {
  CORRECTIVE   // Corregir el problema actual
  PREVENTIVE   // Prevenir recurrencia
}

enum CAPStatus {
  PENDING
  IN_PROGRESS
  IMPLEMENTED
  VERIFIED
  CLOSED
}
```

---

## Permisos Requeridos

### Approval Workflow
- `work_orders.approve_level_1` - Aprobar nivel supervisor
- `work_orders.approve_level_2` - Aprobar nivel manager
- `work_orders.approve_level_3` - Aprobar nivel director
- `work_orders.qa_signoff` - Firmar QA

### Safety Integration
- `safety.issue_permits` - Emitir permisos de trabajo
- `safety.authorize_permits` - Autorizar permisos
- `safety.manage_loto` - Gestionar LOTO
- `safety.approve_jsa` - Aprobar JSA

### Root Cause Analysis
- `rca.create` - Crear análisis RCA
- `rca.review` - Revisar RCA
- `rca.approve` - Aprobar RCA
- `capa.create` - Crear acciones CAPA
- `capa.verify` - Verificar efectividad CAPA

---

## Flujo Completo Propuesto

```
1. Técnico crea OT (DRAFT)
   ↓
2. Sistema evalúa ApprovalRules
   - Si requiere aprobación → PENDING_APPROVAL
   - Si no requiere → Directamente a ASSIGNED
   ↓
3. Supervisor/Manager aprueba (APPROVED) o rechaza (REJECTED)
   ↓
4. Si requiere Safety:
   - Issue Work Permit
   - Apply LOTO (si aplica)
   - Complete JSA
   ↓
5. Asignar técnico (ASSIGNED)
   ↓
6. Ejecutar trabajo (IN_PROGRESS)
   ↓
7. Completar trabajo (PENDING_QA)
   ↓
8. QA Sign-off (si aplica)
   ↓
9. Si es correctivo: Crear RCA
   - Analizar causa raíz (5-Why/Fishbone)
   - Definir CAPA
   - Asignar acciones preventivas
   ↓
10. Cerrar OT (COMPLETED)
```

---

## Prioridades de Implementación

### Fase 1 (Crítico)
- [ ] Approval Workflow básico
- [ ] Safety: Work Permits básicos
- [ ] RCA: 5-Why básico

### Fase 2 (Importante)
- [ ] LOTO Tracking completo
- [ ] JSA completo
- [ ] Fishbone diagrams

### Fase 3 (Mejora continua)
- [ ] CAPA tracking completo
- [ ] Effectiveness verification
- [ ] Trending y analytics
