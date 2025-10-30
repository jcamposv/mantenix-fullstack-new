/**
 * Better Auth Configuration - Complete Enterprise Authentication
 * 
 * Architecture Decision:
 * - Better Auth handles everything: sessions, MFA, middleware, TypeScript types
 * - PostgreSQL stores extended user data and company relationships
 * - Native Better Auth plugins for enterprise security features
 */

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
// import { twoFactor } from "better-auth/plugins"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  
  // ============================================================================
  // EMAIL & PASSWORD CONFIGURATION
  // ============================================================================
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later for production

    // Password reset configuration
    sendResetPassword: async ({ user, url }) => {
      // Import dynamically to avoid circular dependencies
      const { sendPasswordResetEmail } = await import("./email")
      const { prisma } = await import("./prisma")

      // Get user's company info
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: { company: true }
      })

      if (!userData) return

      await sendPasswordResetEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        adminName: "Administrator",
        companyName: userData.company?.name || "Mantenix",
        resetLink: url,
        companyId: userData.companyId || ""
      })
    },

    resetPasswordTokenExpiresIn: 60 * 60 * 24, // 24 hours
  },

  // ============================================================================
  // SESSION CONFIGURATION (Enterprise Security)
  // ============================================================================
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days max (but role-based timeout in middleware)
    updateAge: 60 * 15,           // Update session every 15 minutes
    cookieCache: {
      enabled: true,
      maxAge: 60 * 15, // 15 minutes
    },
  },

  // ============================================================================
  // ADVANCED SECURITY (simplified for testing)
  // ============================================================================
  // security: {
  //   // Rate limiting for login attempts
  //   rateLimit: {
  //     enabled: true,
  //     login: {
  //       max: 5,                    // 5 attempts
  //       window: 15 * 60 * 1000,    // per 15 minutes
  //     },
  //     
  //     // Additional endpoints
  //     signUp: {
  //       max: 3,
  //       window: 60 * 60 * 1000,    // 3 signups per hour
  //     },
  //   },
  //   
  //   // Account lockout after failed attempts
  //   accountLockout: {
  //     enabled: true,
  //     maxAttempts: 5,
  //     lockDuration: 30 * 60 * 1000, // 30 minutes
  //   },
  //   
  //   // CSRF protection
  //   csrfProtection: {
  //     enabled: true,
  //   },
  // },

  // ============================================================================
  // SOCIAL PROVIDERS (Future: SSO)
  // ============================================================================
  socialProviders: {
    // Future: Add Microsoft Azure AD, Google Workspace for enterprise SSO
  },

  // ============================================================================
  // PLUGINS - Enterprise Security Features
  // ============================================================================
  plugins: [
    nextCookies(),
    // Temporarily disabled 2FA plugin until basic auth works
    // twoFactor({
    //   issuer: "Mantenix",
    //   totpOptions: {
    //     period: 30,
    //     digits: 6,
    //     algorithm: "SHA1",
    //   },
    //   backupCodesOptions: {
    //     length: 10,
    //     count: 10,
    //   },
    // }),
  ],

  // ============================================================================
  // USER SCHEMA EXTENSION - Better Auth Best Practice
  // ============================================================================
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "TECNICO"
      },
      companyId: {
        type: "string",
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC"
      },
      locale: {
        type: "string", 
        required: false,
        defaultValue: "en"
      },
      preferences: {
        type: "string", // JSON as string
        required: false,
      },
      isLocked: {
        type: "boolean",
        required: false,
        defaultValue: false
      },
      lockedUntil: {
        type: "date",
        required: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
      lastLoginIp: {
        type: "string",
        required: false,
      },
      mfaEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false
      },
      isMfaVerified: {
        type: "boolean",
        required: false,
        defaultValue: false
      }
    }
  },



  // ============================================================================
  // ENVIRONMENT CONFIGURATION
  // ============================================================================
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  
  // Allow dynamic baseURL for subdomain support
  allowDynamicBaseURL: true,
  
  // Trust proxy in production (for proper IP detection)
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? [`https://*.${process.env.DOMAIN_BASE || "mantenix.ai"}`] 
    : [
        "http://localhost:3000", 
        "http://*.localhost:3000",  // Allow any subdomain in development
        "http://192.168.68.120:3000", // Allow mobile testing
        "http://192.168.1.*:3000",    // Allow common network ranges
        "http://192.168.0.*:3000",
        "http://10.0.0.*:3000",
        "https://*.ngrok-free.app",   // Allow ngrok tunnels
        "https://*.ngrok-free.dev",   // Allow ngrok tunnels (new domain)
        "https://*.ngrok.app",        // Allow ngrok tunnels (paid)
        "https://*.ngrok.io",         // Allow ngrok tunnels (legacy)
        "https://*.ngrok.dev"         // Allow ngrok dev domains
      ],
    
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? [`https://*.${process.env.DOMAIN_BASE || "mantenix.ai"}`]
      : [
          "http://localhost:3000", 
          "http://*.localhost:3000",  // Allow any subdomain in development
          "http://192.168.68.120:3000", // Allow mobile testing
          "http://192.168.1.*:3000",    // Allow common network ranges
          "http://192.168.0.*:3000",
          "http://10.0.0.*:3000",
          "https://*.ngrok-free.app",   // Allow ngrok tunnels
          "https://*.ngrok-free.dev",   // Allow ngrok tunnels (new domain)
          "https://*.ngrok.app",        // Allow ngrok tunnels (paid)
          "https://*.ngrok.io",         // Allow ngrok tunnels (legacy)
          "https://*.ngrok.dev"         // Allow ngrok dev domains
        ],
    credentials: true,
  },
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Session = typeof auth.$Infer.Session & {
  user: {
    companyId: string
    role: string
    company: {
      id: string
      name: string
      subdomain: string
      primaryColor: string
      secondaryColor: string
      backgroundColor: string
      logo: string | null
      mfaEnforced: boolean
      ipWhitelist: string[]
      tier: string
    }
    mfaEnabled: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preferences: any
  }
}

export type User = typeof auth.$Infer.Session.user