import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// eslint-disable-next-line no-undef
export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-undef
  globalThis.__prisma = prisma;
}

// Export connection helper for graceful shutdown
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}