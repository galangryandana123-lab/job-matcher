/* eslint-disable @typescript-eslint/no-explicit-any */

// Prisma client wrapper that handles cases where Prisma is not fully initialized
let PrismaClientClass: any = null

try {
  const prismaModule = require('@prisma/client')
  PrismaClientClass = prismaModule.PrismaClient
} catch {
  console.warn('Prisma client not available. Database operations will fail.')
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

function createPrismaClient() {
  if (!PrismaClientClass) {
    // Return a mock client for build time
    return new Proxy({}, {
      get: () => {
        return new Proxy(() => Promise.resolve(null), {
          get: () => () => Promise.resolve(null)
        })
      }
    })
  }
  return new PrismaClientClass()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
