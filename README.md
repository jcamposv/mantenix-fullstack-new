# 🏢 Mantenix - Enterprise Multi-tenant Authentication System

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.3.27-green)](https://www.better-auth.com/)
[![AWS Cognito](https://img.shields.io/badge/AWS-Cognito-orange)](https://aws.amazon.com/cognito/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.0-violet)](https://www.prisma.io/)
[![HIPAA](https://img.shields.io/badge/Compliance-HIPAA%2FSOC2-red)](https://www.hhs.gov/hipaa/)

Sistema de autenticación enterprise para plataforma SaaS multiempresa de gestión de órdenes de trabajo con compliance HIPAA/SOC2.

## 🎯 Características Principales

### 🏗️ Arquitectura Multiempresa
- **Subdominios personalizados**: `acme.mantenix.com`, `techservices.mantenix.com`
- **Aislamiento total de datos** por `companyId`
- **Branding dinámico**: Logo, colores y fuentes personalizadas
- **6 roles jerárquicos**: SUPER_ADMIN → CLIENTE_OPERATIVO

### 🔐 Seguridad Enterprise
- **Compliance HIPAA/SOC2**: Audit logs inmutables con retención de 7 años
- **MFA obligatorio** para roles administrativos (TOTP via AWS Cognito)
- **Rate limiting**: 5 intentos de login por 15 minutos
- **Account lockout**: Bloqueo automático tras 5 intentos fallidos
- **IP whitelisting** opcional por empresa
- **Session timeout diferenciado**: 15 min (admins) / 8h (técnicos)

### 🛠️ Stack Tecnológico
- **Next.js 15** con App Router y React 19
- **Better Auth** para sesiones y middleware
- **AWS Cognito** para autenticación y MFA enterprise
- **Prisma + PostgreSQL** para datos multiempresa
- **React Hook Form + Zod** para validaciones
- **Tailwind CSS + shadcn/ui** para UI

## 📋 Prerequisitos

- Node.js 20.11.0 o superior
- PostgreSQL 13 o superior
- Cuenta AWS con permisos para Cognito, S3 y Lambda
- AWS CLI configurado

## 🚀 Instalación Rápida

### 1. Clonar y Setup Inicial

```bash
# Clonar el repositorio
git clone <repository-url>
cd mantenix

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### 2. Configurar Variables de Entorno

Edita `.env.local` con tus credenciales:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mantenix_dev"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# AWS Credentials
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"

# Cognito (configurar después del deploy)
COGNITO_USER_POOL_ID="us-east-1_XXXXXXXXX"
COGNITO_CLIENT_ID="your-cognito-client-id"
COGNITO_CLIENT_SECRET="your-cognito-client-secret"

# Encryption
ENCRYPTION_MASTER_KEY="your-encryption-master-key"
```

**Generar secretos seguros:**
```bash
# Better Auth Secret
openssl rand -base64 32

# Encryption Master Key
openssl rand -base64 32
```

### 3. Deploy AWS Cognito User Pool

```bash
# Deploy CloudFormation template
aws cloudformation deploy \
  --template-file aws/cognito-user-pool.yaml \
  --stack-name mantenix-cognito-dev \
  --parameter-overrides Environment=development DomainName=mantenix \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Obtener outputs del stack
aws cloudformation describe-stacks \
  --stack-name mantenix-cognito-dev \
  --query 'Stacks[0].Outputs'
```

Actualiza `.env.local` con los valores obtenidos:
```bash
COGNITO_USER_POOL_ID="us-east-1_XXXXXXXXX"
COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 4. Setup Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Aplicar schema a la base de datos
npm run db:push

# Seed con datos de demo
npm run db:seed
```

### 5. Iniciar Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Acceder a la aplicación
# - Dominio principal: http://localhost:3000
# - ACME Corp: http://acme.localhost:3000
# - TechServices: http://techservices.localhost:3000
```

## 🔑 Credenciales de Demo

### Super Administrador (Global)
```
Email: admin@mantenix.com
Password: SuperAdmin123!@#
Acceso: Gestión global del sistema
```

### ACME Corporation (acme.localhost:3000)
```
Admin: admin@acme.com / AdminEmpresa123!@#
Supervisor: supervisor@acme.com / Supervisor123!@#
Técnico: tech@acme.com / Tecnico123!@#
Cliente: client@acme.com / Cliente123!@#
```

### TechServices Inc (techservices.localhost:3000)
```
Admin: admin@techservices.com / AdminEmpresa123!@#
Técnico: tech@techservices.com / Tecnico123!@#
```

## 🏗️ Arquitectura del Sistema

### Flujo de Autenticación

```mermaid
graph TD
    A[Usuario accede a acme.mantenix.com] --> B[Middleware detecta subdomain]
    B --> C[Query Company por subdomain]
    C --> D[Aplicar branding dinámico]
    D --> E[Verificar autenticación]
    E --> F{¿Autenticado?}
    F -->|No| G[Redirect a /login]
    F -->|Sí| H{¿Requiere MFA?}
    H -->|Sí| I[Verificar MFA]
    H -->|No| J[Acceso autorizado]
    I --> K{¿MFA válido?}
    K -->|Sí| J
    K -->|No| L[Redirect a /mfa]
```

### Estructura de Roles

```
SUPER_ADMIN (Nivel 6)
├── Gestión global del sistema
├── Crear/editar empresas
└── Acceso a todas las funciones

ADMIN_EMPRESA (Nivel 5)
├── Gestión de su empresa
├── Crear/editar usuarios
├── Configurar branding
└── Ver audit logs

SUPERVISOR (Nivel 4)
├── Gestión de técnicos
├── Asignar órdenes de trabajo
└── Ver reportes

TECNICO (Nivel 3)
├── Ver órdenes asignadas
├── Completar trabajos
└── App móvil con offline

CLIENTE_ADMIN (Nivel 2)
├── Ver todas las órdenes
└── Gestionar usuarios cliente

CLIENTE_OPERATIVO (Nivel 1)
├── Crear alertas
└── Ver estado de órdenes
```

## 📁 Estructura del Proyecto

```
mantenix/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/              # Página de login adaptada
│   │   │   └── mfa/                # Verificación MFA
│   │   ├── (dashboard)/            # UI del dashboard
│   │   └── api/
│   │       ├── auth/[...all]/      # Better Auth handler
│   │       └── branding/           # API branding dinámico
│   ├── components/
│   │   ├── login-form.tsx          # Login con React Hook Form
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth config
│   │   ├── auth-client.ts          # React hooks
│   │   ├── cognito.ts              # AWS Cognito client
│   │   ├── audit.ts                # Sistema de auditoría
│   │   ├── encryption.ts           # Encriptación AES-256
│   │   ├── validations.ts          # Esquemas Zod
│   │   └── prisma.ts              # Cliente Prisma
│   └── hooks/                      # Custom React hooks
├── prisma/
│   ├── schema.prisma              # Schema multiempresa
│   └── seed.ts                    # Datos iniciales
├── aws/
│   └── cognito-user-pool.yaml     # CloudFormation template
├── middleware.ts                  # Subdomain + auth + branding
└── .env.example                   # Variables de entorno
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build              # Build de producción
npm run start              # Servidor de producción
npm run lint               # Linting

# Base de datos
npm run db:push            # Aplicar schema
npm run db:migrate         # Crear migración
npm run db:seed            # Seed con datos demo
npm run db:studio          # Prisma Studio
npm run db:reset           # Reset completo
```

## 🛡️ Configuración de Seguridad

### 1. Configurar MFA para Administradores

```typescript
// Después del primer login, habilitar MFA
const { setupMFAForUser } = require('./src/lib/cognito');

// Esto generará un QR code para Google Authenticator
const mfaResult = await setupMFAForUser(accessToken);
console.log('QR Code URL:', mfaResult.qrCodeUrl);
```

### 2. Configurar IP Whitelisting

```sql
-- Actualizar empresa con IPs permitidas
UPDATE companies 
SET "ipWhitelist" = ARRAY['192.168.1.0/24', '10.0.0.100']
WHERE subdomain = 'acme';
```

### 3. Verificar Integridad de Audit Logs

```bash
# Script para verificar cadena de audit logs
npm run audit:verify
```

## 🌐 Configuración de Subdominios

### Desarrollo Local

Agregar a `/etc/hosts` (macOS/Linux) o `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 acme.localhost
127.0.0.1 techservices.localhost
127.0.0.1 startup.localhost
```

### Producción

Configurar DNS con wildcard:
```
*.mantenix.com  CNAME  your-load-balancer.region.elb.amazonaws.com
```

## 📊 Monitoreo y Logs

### Audit Logs
- **Retención**: 7 años (compliance HIPAA)
- **Inmutabilidad**: Hash encadenado blockchain-style
- **Eventos**: Login, logout, cambios de usuario, acceso de datos

### Security Events
- Logins fallidos
- Cuentas bloqueadas
- Actividad sospechosa
- Cambios de permisos

### Métricas Recomendadas
- Tiempo de respuesta de autenticación
- Intentos de login fallidos por IP
- Uso de MFA por empresa
- Distribución de roles por empresa

## 🚀 Deployment en Producción

### 1. Configurar Environment Variables

```bash
# Production .env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://mantenix.com"
BETTER_AUTH_URL="https://mantenix.com"

# Database (con SSL)
DATABASE_URL="postgresql://user:pass@prod-db:5432/mantenix?sslmode=require"

# AWS Production
AWS_REGION="us-east-1"
COGNITO_ADVANCED_SECURITY="ENFORCED"
```

### 2. Deploy CloudFormation

```bash
aws cloudformation deploy \
  --template-file aws/cognito-user-pool.yaml \
  --stack-name mantenix-cognito-prod \
  --parameter-overrides Environment=production \
  --capabilities CAPABILITY_IAM
```

### 3. Database Migration

```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# NO ejecutar seed en producción
# Los datos se crean via admin interface
```

## 🔍 Troubleshooting

### Error: "Module not found: Can't resolve './prisma'"
```bash
# Regenerar Prisma Client
npx prisma generate
```

### Error: "z.string().ip is not a function"
```bash
# Actualizar Zod a la versión correcta
npm update zod
```

### Error: Cognito User Pool not found
```bash
# Verificar que el CloudFormation se deployó correctamente
aws cloudformation describe-stacks --stack-name mantenix-cognito-dev
```

### Error: Subdomain no funciona en desarrollo
```bash
# Verificar /etc/hosts
cat /etc/hosts | grep localhost

# Debe contener:
# 127.0.0.1 acme.localhost
# 127.0.0.1 techservices.localhost
```

## 📚 Recursos Adicionales

### Documentación
- [Better Auth Docs](https://www.better-auth.com/docs)
- [AWS Cognito Guide](https://docs.aws.amazon.com/cognito/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

### Compliance
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [SOC2 Framework](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf)

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

## 🤝 Contribución

### Git Workflow
```bash
# Feature branch
git checkout -b feature/nueva-funcionalidad

# Commits descriptivos
git commit -m "feat: agregar verificación IP whitelisting"

# Tests antes de merge
npm run lint
npm run build
```

### Commit Convention
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📞 Soporte

### Issues
- Reportar bugs via GitHub Issues
- Incluir logs, environment, y pasos para reproducir

### Security Issues
- **NO reportar vulnerabilidades via issues públicos**
- Contactar directamente: security@mantenix.com

### Enterprise Support
- Soporte 24/7 disponible para clientes Enterprise
- SLA de respuesta según tier de suscripción

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

**🏢 Mantenix** - Transformando la gestión de órdenes de trabajo con tecnología enterprise.

[![Deployment Status](https://img.shields.io/badge/Deployment-Ready-green)](https://mantenix.com)
[![Security](https://img.shields.io/badge/Security-Enterprise-blue)](https://mantenix.com/security)
[![Support](https://img.shields.io/badge/Support-24%2F7-orange)](mailto:support@mantenix.com)