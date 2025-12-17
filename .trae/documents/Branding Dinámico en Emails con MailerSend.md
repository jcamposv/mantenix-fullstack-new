## Objetivo
Agregar soporte de branding dinámico (logo, colores, nombre) en todos los correos enviados vía MailerSend, controlado desde la API: por defecto se toma el branding del tenant (`Company`) y opcionalmente se permite override por request.

## Alcance
- Aplicable a todos los tipos de email (`WELCOME`, `USER_INVITATION`, `WORK_ORDER_*`, `ALERT_*`, `PASSWORD_RESET`).
- No se crean plantillas HTML locales; se usan `templateId` de MailerSend con variables.

## Diseño
1. Fuente de branding por defecto
   - Leer branding de la empresa (`Company`) usando `companyId` disponible en el flujo de envío.
   - Campos: `logo`, `logoSmall`, `primaryColor`, `secondaryColor`, `backgroundColor`, `name` (y `customFont` si se requiere).
   - Referencias: `prisma/schema.prisma:352-408`, `src/server/repositories/company.repository.ts:33-38`.

2. Override de branding por API
   - Extender payloads que disparan envíos (p. ej. invitaciones) para aceptar `branding` opcional con los mismos campos.
   - Seguridad: solo roles administradores ya permitidos pueden enviar la invitación; el override no cambia credenciales de envío (se mantiene `EmailConfiguration`).
   - Referencias: `src/app/api/admin/invite-user/route.ts:29-33` (parse del body) y `src/app/api/admin/invite-user/route.ts:224-232` (llamada al mailer).

3. Variables de plantilla comunes de branding
   - Estandarizar nombres de variables para MailerSend:
     - `brand_name`, `brand_logo_url`, `brand_logo_small_url`, `brand_primary_color`, `brand_secondary_color`, `brand_background_color`, `brand_font`.
   - Extender el catálogo de variables por tipo para que el editor de templates conozca qué puede usar.
   - Referencias: `src/types/email.types.ts:150-250`.

## Cambios propuestos
1. Tipos
   - `src/types/email.types.ts:126-134`: extender `SendEmailData` con `brandingOverride?: { logoUrl?, logoSmallUrl?, primaryColor?, secondaryColor?, backgroundColor?, brandName?, font? }`.
   - Añadir `COMMON_BRANDING_VARIABLES` y mezclar en cada entrada de `TEMPLATE_VARIABLES`.

2. Servicio de envío
   - `src/server/services/email-sender.service.ts:17-68`:
     - Antes de construir `EmailParams`, cargar branding:
       - Si `data.brandingOverride` existe, usar esos valores.
       - Si no, leer `Company` por `data.companyId` y mapear a variables comunes.
     - Hacer merge: `variables = { ...brandingVars, ...data.variables }` para que el asunto y el template puedan usar branding.
     - Mantener `EmailConfiguration` como origen de `apiToken`, `fromEmail`, `fromName`.

3. Endpoint de invitación
   - `src/app/api/admin/invite-user/route.ts:29-33`: aceptar campo opcional `branding` en el body.
   - `src/lib/email.ts:7-15,17-45`: extender `InviteEmailData` con `brandingOverride?` y propagar hasta `EmailSenderService.sendInvitationEmail`.
   - Validación (simple): si se incluye `branding`, validar URLs (logo) y hex de colores con Zod.
   - Nota: existe `updateBrandingSchema` reutilizable (`src/lib/validations.ts:167-191`).

4. Documentación de templates
   - Añadir instrucción visible a administradores indicando variables disponibles de branding para configurar en MailerSend.
   - Ejemplos de uso: `{{ brand_logo_url }}`, `{{ brand_primary_color }}`, `{{ brand_name }}`.

## Comportamiento esperado
- Si no se pasa `branding` en la API, los correos salen con el branding del tenant (`Company`).
- Si se pasa `branding`, esos valores se usan en esa entrega concreta sin afectar el branding global.
- MailerSend recibe `personalization` con variables de contenido + branding, y el `subject` puede usar `brand_name`.

## Verificación
- Test manual: enviar una invitación con y sin `branding` override y confirmar:
  - El asunto se renderiza con `brand_name`.
  - La plantilla de MailerSend muestra el logo/colores esperados (variables resueltas).
- Logs: confirmar `messageId` y ausencia de errores en `email-sender.service.ts`.

## Riesgos y mitigaciones
- Falta de `logo`/colores: enviar `null`/default y que el template maneje fallback.
- Plantillas en MailerSend no preparadas: documentar variables y actualizar templates.
- Incremento de lectura a DB: una consulta extra por envío para `Company`; aceptable.

## Entregables
- Código actualizado en `types`, `email-sender.service`, `invite-user` API y `lib/email.ts`.
- Guía breve de variables de branding para templates.
