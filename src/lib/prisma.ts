import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Connection management
let isConnected = false;

export async function connectPrisma() {
  if (isConnected) return prisma;

  try {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Prisma connected successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectPrisma() {
  if (!isConnected) return;

  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log('✅ Prisma disconnected successfully');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', connected: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectPrisma();
});