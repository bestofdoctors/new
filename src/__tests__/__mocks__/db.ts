// Mock database operations for testing
export const prisma = {
  mint: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-mint-id',
      status: 'PENDING',
      tokenId: 'test-token-123',
      user: { id: 'mock-user-id', email: 'test@example.com' }
    }),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  listing: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-listing-id', 
      status: 'ACTIVE',
      tokenId: 'test-token-123',
      price: '1.5',
      currency: 'ETH',
      user: { id: 'mock-user-id', email: 'test@example.com' }
    }),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  collection: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-collection-id',
      name: 'Test Collection'
    }),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  collectionItem: {
    create: jest.fn().mockResolvedValue({
      id: 'mock-item-id',
      item: { name: 'Test Item' }
    }),
    count: jest.fn().mockResolvedValue(42),
    findMany: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
} as any;

export async function connectDB() {
  console.log('Mock database connected successfully');
}

export async function disconnectDB() {
  console.log('Mock database disconnected successfully');
}