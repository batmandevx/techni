// Prisma client with fallback for builds without database
let prisma: any = null;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const globalForPrisma = globalThis as unknown as {
      prisma: typeof PrismaClient | undefined;
    };
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  } catch {
    prisma = null;
  }
}

export { prisma };
