# Flujo de Trabajo con Prisma - Mantenix

Esta guía explica cómo trabajar con Prisma de forma segura en desarrollo y producción.

## 🚨 Regla de Oro

**NUNCA uses `prisma db push` para cambios que irán a producción.**

Use `prisma migrate dev` siempre que vayas a hacer deploy a producción.

---

## 📋 Flujo de Trabajo Completo

### 1️⃣ Desarrollo Local (DEV)

Cuando haces cambios al schema:

```bash
# 1. Edita prisma/schema.prisma con tus cambios

# 2. Crea una migración formal (RECOMENDADO)
npm run db:migrate
# o manualmente:
npx prisma migrate dev --name descripcion_del_cambio

# 3. Prueba exhaustivamente en desarrollo

# 4. Commitea schema.prisma Y la carpeta de migraciones
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "Add: descripción del cambio"
git push
```

**Ejemplo de nombres descriptivos:**
- `add_work_order_prefix_system`
- `add_email_templates`
- `update_user_roles`
- `fix_asset_cascade_delete`

### 2️⃣ Producción (PROD)

**Automático en Vercel:**
Cuando haces push a la rama `main`, Vercel ejecuta:

```bash
npm run build
# que internamente corre:
# prisma generate && prisma migrate deploy && next build --turbopack
```

`prisma migrate deploy`:
- ✅ Aplica solo migraciones pendientes
- ✅ NO crea nuevas migraciones
- ✅ Es seguro para producción
- ✅ Transaccional (rollback si falla)

---

## 🔧 Comandos Útiles

### Comandos Principales

```bash
# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (interfaz visual de BD)
npm run db:studio

# Generar Prisma Client (tipos TypeScript)
npx prisma generate

# Resetear BD de desarrollo (DESTRUCTIVO)
npm run db:reset
```

### Comandos de Desarrollo

```bash
# Prototipado rápido (NO para prod)
npm run db:push
# Usa esto SOLO para experimentar, luego crea migración formal

# Crear migración sin aplicar
npx prisma migrate dev --create-only --name mi_migracion
# Luego editas el SQL manualmente si necesitas
# Y aplicas con: npx prisma migrate dev
```

### Comandos de Emergencia

```bash
# Marcar migración como aplicada sin ejecutarla
npx prisma migrate resolve --applied "20251029000000_nombre"

# Marcar migración como fallida
npx prisma migrate resolve --rolled-back "20251029000000_nombre"
```

---

## 🛡️ Protección contra Errores

### Variables de Ambiente

**Desarrollo:**
```env
# .env.local (GIT IGNORED)
DATABASE_URL="postgresql://user:pass@localhost:5432/mantenix_dev"
```

**Producción:**
```env
# En Vercel Dashboard (Environment Variables)
DATABASE_URL="postgresql://user:pass@prod-host:5432/mantenix_prod"
```

### .gitignore

Tu `.gitignore` debe tener:
```
.env*        # ✅ Variables de ambiente (seguridad)
/node_modules
/.next
```

**NUNCA ignores:**
- ❌ `/prisma/migrations/` - DEBE estar en git
- ❌ `prisma/schema.prisma` - DEBE estar en git

---

## ⚠️ Problemas Comunes

### Drift Detectado

**Error:**
```
Drift detected: Your database schema is not in sync with your migration history
```

**Solución:**
```bash
# 1. Crear migración baseline
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_baseline
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_baseline/migration.sql

# 2. Marcar como aplicada
npx prisma migrate resolve --applied "YYYYMMDDHHMMSS_baseline"
```

### Tipos de Prisma no disponibles

**Error:**
```
Property 'WorkOrderPrefixWhereInput' does not exist on type 'Prisma'
```

**Solución:**
```bash
npx prisma generate
```

### Migración falló en producción

**NO ENTRES EN PÁNICO:**

```bash
# 1. Ver el estado
npx prisma migrate status

# 2. Si la migración falló a medias
npx prisma migrate resolve --rolled-back "nombre_migracion"

# 3. Fix el problema y vuelve a deploy
```

---

## 📚 Referencia Rápida

| Comando | Cuándo Usarlo | Entorno |
|---------|---------------|---------|
| `prisma migrate dev` | Crear nueva migración | DEV |
| `prisma migrate deploy` | Aplicar migraciones | PROD (automático) |
| `prisma db push` | Prototipado rápido | DEV (experimental) |
| `prisma generate` | Generar tipos TS | DEV/PROD |
| `prisma migrate status` | Ver estado | DEV/PROD |
| `prisma studio` | Interfaz visual BD | DEV |
| `prisma migrate reset` | Resetear BD | DEV (destructivo) |

---

## ✅ Checklist para Deploy

Antes de hacer push a producción:

- [ ] Todos los cambios de schema tienen migración formal
- [ ] Migraciones probadas en desarrollo
- [ ] `npx prisma migrate status` muestra "up to date"
- [ ] Carpeta `prisma/migrations/` commiteada en git
- [ ] Variables de ambiente configuradas en Vercel
- [ ] Backup de BD de producción (si es cambio crítico)

---

## 🆘 Ayuda

- **Documentación Prisma:** https://www.prisma.io/docs
- **Migrate Guide:** https://www.prisma.io/docs/orm/prisma-migrate

**¿Dudas?** Revisa este documento antes de hacer cambios a producción.
