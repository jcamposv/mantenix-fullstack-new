/**
 * Simplified Better Auth Configuration
 * Basic authentication without complex callbacks
 */

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Simplified for testing
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 15,           // Update every 15 minutes
    
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".mantenix.ai" : ".localhost",
    },
  },

  // Basic security without complex rate limiting
  security: {
    csrfProtection: {
      enabled: true,
    },
  },

  // Environment configuration
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  
  // Allow dynamic baseURL for subdomain support
  allowDynamicBaseURL: true,
  
  // Trust origins for development
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? ["https://*.mantenix.ai"] 
    : [
        "http://localhost:3000", 
        "http://acme.localhost:3000",
        "http://techservices.localhost:3000", 
        "http://startup.localhost:3000"
      ],
})

// Type exports
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user