/**
 * Prisma Configuration
 * Replaces deprecated package.json#prisma configuration
 * For more information: https://pris.ly/prisma-config
 */

import 'dotenv/config'
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})
