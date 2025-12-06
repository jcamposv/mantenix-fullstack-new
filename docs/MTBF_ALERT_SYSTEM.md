# Sistema de Alertas MTBF con ISO 14224

## Resumen Ejecutivo

Sistema completo de alertas predictivas de mantenimiento basado en ISO 14224 que calcula automáticamente stock mínimo y genera alertas inteligentes antes de que ocurran fallas.

## 🎯 Características Principales

### 1. Cálculo Automático de Stock Mínimo
- Basado en criticidad del componente (A/B/C)
- Considera MTBF, MTTR y leadTime real
- Actualización automática desde formularios

### 2. Alertas Predictivas MTBF
- 5 niveles de alertas según severidad
- Considera horas de operación reales de activos
- Auto-refresh cada 60 segundos

### 3. Integración Completa
- Dashboard principal
- Dashboard de inventario
- Página de detalle de componentes
- Formularios con cálculo en vivo

---

## 📊 Arquitectura del Sistema

### Base de Datos

```prisma
// InventoryItem - Tiempo de entrega del proveedor
model InventoryItem {
  leadTime Int @default(7) // Días de entrega
}

// Asset - Horas de operación
model Asset {
  operatingHours Int? // Horas actuales (manual o sensores)
}

// ExplodedViewComponent - Datos técnicos ISO 14224
model ExplodedViewComponent {
  criticality    ComponentCriticality? // A, B, C
  mtbf           Int? // Mean Time Between Failures (horas)
  mttr           Int? // Mean Time To Repair (horas)
  lifeExpectancy Int? // Vida útil esperada (horas)
  inventoryItemId String? // Link a inventario
}
```

### Flujo de Datos

```
┌─────────────────┐
│   Asset         │ operatingHours (manual o calculado)
│  12,000 hrs     │
└────────┬────────┘
         │ usado en
         ↓
┌─────────────────┐
│  Component      │ criticality: A
│  "Motor ABC"    │ mtbf: 5000 hrs
└────────┬────────┘ mttr: 2 hrs
         │ vinculado a
         ↓
┌─────────────────┐
│ InventoryItem   │ leadTime: 15 días
│  "Repuesto XYZ" │ currentStock: 2
└────────┬────────┘ minStock: 4
         │
         ↓
┌─────────────────────────────────────┐
│  MTBF Alert Generator               │
│                                     │
│  currentOp: 12,000 hrs              │
│  mtbf: 5,000 hrs                    │
│  → próximo fallo en 24 días         │
│                                     │
│  leadTime: 15 días                  │
│  → necesita 15 días para recibir    │
│                                     │
│  ⚠️ ALERTA: Ordenar ahora!         │
│  (24 días < 30 días buffer)         │
└─────────────────────────────────────┘
```

---

## 🧮 Fórmula de Cálculo

### 1. Stock Mínimo (ISO 14224)

```typescript
// Factores de criticidad
const CRITICALITY_FACTORS = {
  A: 3,  // Crítico - paro total
  B: 2,  // Importante - degradación
  C: 1,  // Menor - sin impacto
}

// Consumo mensual basado en MTBF
monthlyConsumption = (30 días × 24 hrs/día) / MTBF

// Buffer por tiempo de entrega
leadTimeBuffer = Math.ceil(leadTime / 30)

// Stock mínimo
minStock = criticalityFactor × monthlyConsumption × leadTimeBuffer

// Stock de seguridad (50% extra)
safetyStock = minStock × 1.5

// Punto de reorden
reorderPoint = usageDuringLeadTime + safetyStock
```

**Ejemplo Real:**
```
Componente: Motor Bomba Hidráulica
- Criticidad: A (paro total si falla)
- MTBF: 5,000 horas
- Lead Time: 15 días
- MTTR: 2 horas

Cálculo:
monthlyConsumption = (30 × 24) / 5000 = 0.144 ≈ 1 unidad/mes
leadTimeBuffer = 15 / 30 = 0.5 ≈ 1
minStock = 3 × 1 × 1 = 3 unidades
safetyStock = 3 × 1.5 = 4.5 ≈ 5 unidades
reorderPoint = 1 + 5 = 6 unidades
```

### 2. Alertas MTBF

```typescript
// Horas hasta próxima falla
hoursUntilMaintenance = MTBF - currentOperatingHours

// Días hasta mantenimiento
daysUntilMaintenance = hoursUntilMaintenance / 24

// CRÍTICO: Sin stock + mantenimiento inminente
if (currentStock === 0 && daysUntilMaintenance <= leadTime) {
  severity: CRITICAL
  message: "⚠️ CRÍTICO: Sin stock, ordenar URGENTE"
}

// URGENTE: Stock bajo + no hay tiempo
if (currentStock < minStock && daysUntilMaintenance <= leadTime) {
  severity: CRITICAL
  message: "🚨 URGENTE: Ordenar ahora, no hay tiempo"
}

// ADVERTENCIA: Cerca del punto de reorden
if (currentStock < reorderPoint && daysUntilMaintenance <= leadTime * 1.5) {
  severity: WARNING
  message: "⚠️ Considerar ordenar pronto"
}
```

---

## 🔧 Operating Hours: ¿Cómo Funciona?

### Estrategia de Obtención

El sistema usa una cascada de métodos para obtener horas de operación:

```typescript
// 1. Valor manual (si existe)
if (asset.operatingHours) {
  return asset.operatingHours
}

// 2. Cálculo desde fecha de compra
if (asset.purchaseDate) {
  daysSince = today - purchaseDate
  return daysSince × 12 hrs/día  // Asume 12 hrs operación diaria
}

// 3. Desde fecha de registro
if (asset.registrationDate) {
  daysSince = today - registrationDate
  return daysSince × 12 hrs/día
}

// 4. Default
return 0
```

### Actualización Manual

```typescript
// Desde API de Asset
PUT /api/assets/{id}
{
  "operatingHours": 15000
}

// O desde WorkOrder al completar
POST /api/work-orders/{id}/complete
{
  "completedAt": "2024-12-06T10:00:00Z",
  "operatingHours": 15123  // Leer del odómetro/sensor
}
```

---

## 🚦 Niveles de Alerta

### CRITICAL (Rojo)
- **Condición**: Sin stock O stock insuficiente + mantenimiento inminente
- **Acción**: Ordenar URGENTE con proveedor alternativo
- **Prioridad**: 1 (máxima)
- **Icono**: AlertCircle rojo

### WARNING (Amarillo)
- **Condición**: Stock bajo + tiempo limitado
- **Acción**: Planificar orden pronto
- **Prioridad**: 2
- **Icono**: AlertTriangle amarillo

### INFO (Azul)
- **Condición**: Informativo, tiempo suficiente
- **Acción**: Monitorear
- **Prioridad**: 3
- **Icono**: Info azul

---

## 📍 Ubicaciones en la UI

### 1. Dashboard Principal (`/dashboard`)
```tsx
<MTBFAlerts
  limit={5}
  criticalOnly={true}
  autoRefresh={true}
/>
```
- Muestra solo alertas críticas
- Auto-refresh cada 60 segundos
- Ubicado en columna derecha

### 2. Dashboard Inventario (`/admin/inventory`)
```tsx
<MTBFAlerts
  limit={5}
  criticalOnly={true}
  autoRefresh={true}
/>
```
- Todas las alertas de mantenimiento
- Integrado con alertas de stock bajo

### 3. Detalle de Componente (`/admin/exploded-view-components/[id]`)
```tsx
{alert && <MTBFAlertCard alert={alert} />}
<ComponentTechnicalSpecs />
<ComponentHierarchy />
```
- Alerta específica del componente
- Specs técnicas ISO 14224
- Jerarquía padre-hijo

### 4. Formulario de Edición
```tsx
<CalculateStockButton
  componentId={id}
  onSuccess={handleSuccess}
/>
```
- Botón "Calcular Stock Mínimo"
- Solo visible si tiene inventoryItem vinculado
- Actualiza automáticamente

---

## 🎬 Casos de Uso

### Caso 1: Componente Crítico con MTBF Próximo

**Escenario:**
- Motor principal con criticidad A
- MTBF: 5,000 horas
- Operating hours actual: 4,800 horas
- Lead time: 15 días
- Stock actual: 1 unidad
- Stock mínimo: 3 unidades

**Cálculo:**
```
hoursUntilMaintenance = 5000 - 4800 = 200 hrs
daysUntilMaintenance = 200 / 24 = 8.3 días

Condición: 8.3 días < 15 días leadTime
         + Stock 1 < MinStock 3

Resultado: ⚠️ ALERTA CRÍTICA
```

**Acción del Sistema:**
1. Genera alerta CRITICAL
2. Muestra en dashboard con prioridad máxima
3. Recomienda: "Ordenar URGENTE - Solo 8 días para mantenimiento, leadTime 15 días"

### Caso 2: Planificación Preventiva

**Escenario:**
- Filtro con criticidad B
- MTBF: 2,000 horas
- Operating hours: 1,500 horas
- Lead time: 7 días
- Stock: 5 unidades
- Stock mínimo: 2 unidades

**Cálculo:**
```
daysUntilMaintenance = (2000 - 1500) / 24 = 20.8 días
Stock actual > reorderPoint

Resultado: ℹ️ INFO - Todo bien
```

**Acción del Sistema:**
1. No genera alerta urgente
2. Muestra en lista general como INFO
3. Mensaje: "Próximo mantenimiento en 21 días, stock suficiente"

---

## 🔐 Seguridad y Permisos

El sistema respeta los permisos existentes:

```typescript
// Crear/Editar componentes
PermissionGuard.require(session, 'assets.create')
PermissionGuard.require(session, 'assets.edit')

// Ver alertas
PermissionGuard.require(session, 'inventory.view')

// Calcular stock
PermissionGuard.require(session, 'inventory.edit')
```

Roles con acceso completo:
- **SUPER_ADMIN**: Todo
- **ADMIN_EMPRESA**: Todo en su empresa
- **ADMIN_CORPORATIVO**: Todo en grupo corporativo

---

## 💡 Mejores Prácticas

### 1. LeadTime Realista
```
❌ Malo: leadTime = 1 día (muy optimista)
✅ Bueno: leadTime = 7 días (estándar)
✅ Mejor: leadTime = 15 días (proveedor internacional)
```

**Por qué es importante:**
- Determina CUÁNDO alertar
- Si es muy corto → alertas tardías
- Si es muy largo → alertas prematuras (costos de inventario)

### 2. Actualizar Operating Hours
```typescript
// Opción A: Manual desde dashboard
asset.operatingHours = 15000

// Opción B: Automático en WorkOrders
workOrder.complete({
  operatingHours: readFromSensor()
})

// Opción C: Integración con IoT
mqtt.on('sensor/hours', (hours) => {
  asset.update({ operatingHours: hours })
})
```

### 3. Criticidad Correcta
```
A (Crítico):   Paro total de producción
               Ejemplo: Motor principal, bomba única

B (Importante): Degradación de capacidad
               Ejemplo: Bomba de respaldo, filtros

C (Menor):     Sin impacto en operación
               Ejemplo: Luces indicadoras, cosmético
```

### 4. MTBF Realista
```
Fuentes de datos:
1. Especificaciones del fabricante
2. Histórico de fallas propias
3. Estándares de industria (ISO 14224)
4. Datos de proveedores similares
```

---

## 🐛 Troubleshooting

### Problema: No muestra alertas

**Causas posibles:**
1. ✅ Componente tiene MTBF definido?
2. ✅ Componente tiene inventoryItem vinculado?
3. ✅ InventoryItem tiene leadTime?
4. ✅ Asset tiene operating hours (o purchaseDate)?

**Solución:**
```typescript
// Verificar componente
component.mtbf !== null
component.inventoryItemId !== null

// Verificar inventario
inventoryItem.leadTime >= 1

// Verificar asset
asset.operatingHours > 0 || asset.purchaseDate !== null
```

### Problema: Alertas incorrectas

**Diagnóstico:**
```typescript
// Log de cálculo
console.log({
  currentOp: 12000,
  mtbf: 5000,
  hoursUntil: 5000 - 12000, // ❌ Negativo!
  daysUntil: -7000 / 24
})
```

**Causa:** Operating hours mayor que MTBF
**Solución:** El componente ya pasó su MTBF, resetear operating hours después de mantenimiento

### Problema: Stock mínimo muy alto

**Ejemplo:**
```
Componente con criticidad A
MTBF: 500 horas (muy frecuente)
LeadTime: 30 días

Resultado: minStock = 15 unidades
```

**Explicación:** Es correcto! Componentes con fallas frecuentes (MTBF bajo) necesitan más stock.

**Soluciones:**
1. Mejorar confiabilidad del componente
2. Reducir leadTime (proveedor local)
3. Aceptar costo de inventario (criticidad A lo justifica)

---

## 📈 Métricas de Éxito

El sistema está funcionando bien si:

1. **Alertas Oportunas**
   - 0% de paros por falta de repuestos
   - Alertas con >7 días de anticipación

2. **Optimización de Inventario**
   - Stock mínimo calculado automáticamente
   - Reducción de 20-30% en costos de inventario
   - 100% disponibilidad de repuestos críticos

3. **Adopción de Usuario**
   - >80% de componentes con MTBF definido
   - >90% de inventory items con leadTime
   - <10% de alertas ignoradas

---

## 🔄 Roadmap Futuro

### Fase 2: Integración IoT
- Lectura automática de operating hours desde sensores
- Actualización en tiempo real
- Alertas push automáticas

### Fase 3: Machine Learning
- Predicción de MTBF basada en historial
- Optimización automática de stock mínimo
- Detección de anomalías

### Fase 4: Reportes Avanzados
- Dashboard ISO 14224 completo
- Análisis de confiabilidad (Weibull)
- Exportación a PDF/Excel
- KPIs de mantenimiento

---

## 📚 Referencias

- [ISO 14224:2016](https://www.iso.org/standard/64690.html) - Reliability data collection
- [MTBF Calculation Guide](https://www.reliasoft.com/resources/resource-center/mtbf-mean-time-between-failures)
- Next.js Expert Patterns (proyecto interno)

---

**Versión:** 1.0.0
**Última actualización:** 2024-12-06
**Autor:** Claude Code (Anthropic)
