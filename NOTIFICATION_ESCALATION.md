# Sistema de Escalación de Notificaciones

Sistema automático de escalación de alertas a supervisores y administradores basado en prioridad y permisos.

## Características

### Escalación Automática

Cuando se crea o actualiza una alerta, el sistema automáticamente:

1. **Notifica en tiempo real (in-app)** al reportador y asignado
2. **Escala a usuarios con permisos** según la prioridad:

| Prioridad | Permisos Requeridos | Canales de Notificación |
|-----------|-------------------|------------------------|
| **CRITICAL** | `alerts.view_company` + `alerts.update` | Email, Push, In-app |
| **HIGH** | `alerts.view_company` + `work_orders.assign` | Push, In-app |
| **MEDIUM** | Solo asignado/reportador | In-app |
| **LOW** | Solo asignado/reportador | In-app |

3. **Crea notificaciones persistentes** en la base de datos
4. **Procesa emails** usando templates configurados en MailerSend

## Configuración

### 1. Variables de Entorno

Agregar a `.env`:

```bash
# Cron Job Secret (generar con: openssl rand -base64 32)
CRON_SECRET="tu_secret_super_seguro_aqui"

# URL de la aplicación (para links en emails)
NEXT_PUBLIC_APP_URL="https://tu-app.com"
```

### 2. Configurar Cron Job

Tienes 3 opciones:

#### Opción A: Vercel Cron (Recomendado para Vercel)

Crear `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Esto ejecuta el job cada 5 minutos. Ajusta según necesidades:
- `*/5 * * * *` - Cada 5 minutos
- `*/10 * * * *` - Cada 10 minutos
- `*/15 * * * *` - Cada 15 minutos

#### Opción B: Servicio Externo (cron-job.org, EasyCron)

1. Crear cuenta en https://cron-job.org
2. Configurar nuevo cron job:
   - **URL**: `https://tu-app.com/api/cron/process-notifications`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer TU_CRON_SECRET`
   - **Schedule**: Cada 5-10 minutos

#### Opción C: GitHub Actions

Crear `.github/workflows/process-notifications.yml`:

```yaml
name: Process Notifications

on:
  schedule:
    - cron: '*/10 * * * *' # Cada 10 minutos
  workflow_dispatch: # Permite ejecutar manualmente

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cron Endpoint
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/process-notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 3. Configurar Email Templates en MailerSend

1. Ir a MailerSend Dashboard
2. Crear template "ALERT_ESCALATED" con variables:
   - `{{alert_title}}` - Título de la alerta
   - `{{alert_description}}` - Descripción
   - `{{alert_type}}` - Tipo (EQUIPMENT_FAILURE, etc.)
   - `{{alert_priority}}` - Prioridad (CRITICAL, HIGH, etc.)
   - `{{site_name}}` - Nombre de la sede
   - `{{location}}` - Ubicación específica
   - `{{reported_by_name}}` - Nombre del reportador
   - `{{reported_at}}` - Fecha y hora del reporte
   - `{{escalation_reason}}` - Razón de la escalación
   - `{{alert_url}}` - Link a la alerta

3. Copiar el Template ID
4. Guardar template en la base de datos por compañía

## Arquitectura

### Flujo de Notificaciones

```
1. Usuario crea/actualiza alerta
   ↓
2. AlertService.create() / update()
   ↓
3. NotificationService.broadcastNewAlert()
   ├─→ Broadcast tiempo real (SSE)
   └─→ createNotificationsForAlert()
       ├─→ getUsersToNotify() - Encuentra usuarios por permisos
       ├─→ Aplica ESCALATION_RULES
       └─→ AlertNotificationRepository.createMany() - Persiste en BD
   ↓
4. Cron Job (cada 5-10 min)
   ↓
5. NotificationService.processPendingNotifications()
   ├─→ AlertNotificationRepository.findPending()
   ├─→ Por cada notificación tipo "email":
   │   ├─→ AlertRepository.findById()
   │   ├─→ UserRepository.findById()
   │   └─→ EmailSenderService.sendAlertEscalatedEmail()
   │       └─→ MailerSend API con template ALERT_ESCALATED
   └─→ AlertNotificationRepository.markAsSent/Failed()
```

### Archivos Clave

- **Tipos**: `src/types/notification.types.ts`
- **Repository**: `src/server/repositories/alert-notification.repository.ts`
- **Service**: `src/server/services/notification.service.ts`
- **Email Service**: `src/server/services/email-sender.service.ts`
- **Cron Job**: `src/app/api/cron/process-notifications/route.ts`

## Testing

### Test Manual del Cron Job

```bash
# Health check
curl http://localhost:3000/api/cron/process-notifications

# Procesar notificaciones (local)
curl -X POST http://localhost:3000/api/cron/process-notifications \
  -H "Authorization: Bearer tu_cron_secret"

# Procesar notificaciones (producción)
curl -X POST https://tu-app.com/api/cron/process-notifications \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Test de Escalación

1. Crear una alerta con prioridad CRITICAL
2. Verificar que se crearon notificaciones en `alert_notifications` table
3. Llamar al endpoint del cron job
4. Verificar que se enviaron los emails
5. Revisar logs en MailerSend

## Monitoreo

### Ver Notificaciones Pendientes

```sql
SELECT
  an.id,
  an.type,
  an.status,
  a.title as alert_title,
  a.priority,
  u.email,
  an.created_at
FROM alert_notifications an
JOIN alerts a ON an.alert_id = a.id
JOIN users u ON an.user_id = u.id
WHERE an.status = 'pending'
ORDER BY an.created_at ASC;
```

### Ver Notificaciones Fallidas

```sql
SELECT
  an.id,
  an.error_message,
  a.title as alert_title,
  u.email,
  an.created_at
FROM alert_notifications an
JOIN alerts a ON an.alert_id = a.id
JOIN users u ON an.user_id = u.id
WHERE an.status = 'failed'
ORDER BY an.created_at DESC;
```

## Troubleshooting

### Los emails no se envían

1. **Verificar CRON_SECRET**: Debe estar configurado en .env
2. **Verificar cron job**: Debe estar ejecutándose cada 5-10 minutos
3. **Verificar logs**: `console.log` en NotificationService
4. **Verificar MailerSend**: Template ALERT_ESCALATED existe y está activo
5. **Verificar EmailConfiguration**: La compañía tiene configuración activa

### Las notificaciones no se crean

1. **Verificar permisos**: Los usuarios tienen los permisos necesarios
2. **Verificar prioridad**: CRITICAL/HIGH escalan, MEDIUM/LOW no
3. **Verificar companyId**: La alerta tiene site.clientCompany.id válido

### Usuarios no reciben notificaciones

1. **Verificar isLocked**: Usuario debe estar activo (isLocked = false)
2. **Verificar email**: Usuario debe tener email válido
3. **Verificar permisos**: Usuario debe tener al menos uno de los permisos requeridos

## Performance

- **Batch size**: 100 notificaciones por ejecución (configurable)
- **Frecuencia**: Cada 5-10 minutos (ajustable)
- **Timeout**: 2 minutos por ejecución
- **Retry**: No automático (marcar como failed y revisar manualmente)

## Seguridad

- ✅ Endpoint protegido con `CRON_SECRET`
- ✅ Verificación de permisos antes de escalar
- ✅ Logs de errores sin exponer datos sensibles
- ✅ Rate limiting por configuración de email (MailerSend limits)
