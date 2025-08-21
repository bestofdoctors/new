# NFT Backend API - GitHub Copilot Instructions

**ALWAYS follow these instructions first.** Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

This is a production-ready TypeScript Fastify backend API for NFT minting and listing operations, built with PostgreSQL, Redis, Prisma ORM, and comprehensive testing with Jest.

## Working Effectively

### Initial Setup (Required)
```bash
# Navigate to repository root
cd /home/runner/work/new/new

# Install dependencies - takes ~20 seconds
npm install

# Setup environment file
cp .env.example .env
# Edit .env with your configuration if needed
```

### Build and Test Commands
```bash
# Lint code - takes ~1 second
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Build for production - takes ~2 seconds
npm run build

# Run all tests - takes ~7 seconds
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Development Server
```bash
# Start development server with hot reload
npm run dev
# Starts on http://localhost:3000
# Server starts in ~3 seconds and runs successfully

# Health check
curl http://localhost:3000/health
# Returns: {"ok":true}
```

### Production Server
```bash
# Build first (required)
npm run build

# Start production server
npm start
# or directly: node dist/server.js
# Starts on http://localhost:3000
```

### Database Commands (Network-Dependent)
**WARNING**: These commands require network access and may fail in sandboxed environments:

```bash
# Generate Prisma client - FAILS in sandboxed environments due to network restrictions
npm run db:generate

# Push schema to database (development) - requires running PostgreSQL
npm run db:push

# Run database migrations (production) - requires running PostgreSQL
npm run db:migrate

# Open Prisma Studio - requires running PostgreSQL
npm run db:studio
```

### Docker Setup (Network-Dependent)
**WARNING**: Docker builds may take 10+ minutes and require network access:

```bash
# Start all services with Docker Compose (NEVER CANCEL - takes 10+ minutes)
docker compose up -d
# This will fail in sandboxed environments due to network restrictions

# Run database migrations in Docker
docker compose exec api npm run db:migrate

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

## Validation Scenarios

After making any code changes, ALWAYS run these validation steps:

### Basic Validation (Always Required)
```bash
# 1. Lint check
npm run lint

# 2. Build check
npm run build

# 3. Test check
npm test
```

### Functional Validation (When Server Changes Are Made)
```bash
# 1. Start development server
npm run dev

# 2. Test health endpoint
curl http://localhost:3000/health
# Should return: {"ok":true}

# 3. Test NFT mint endpoint
curl -X POST http://localhost:3000/nft/mint \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "test-001", "metadata": {"name": "Test NFT"}}'
# Should return success response with mintId

# 4. Test NFT list endpoint
curl -X POST http://localhost:3000/nft/list \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "test-001", "price": "1.5", "currency": "ETH"}'
# Should return success response with listingId
```

### Production Validation
```bash
# 1. Build for production
npm run build

# 2. Start production server
node dist/server.js &

# 3. Test health endpoint
curl http://localhost:3000/health

# 4. Stop production server
pkill -f "node dist/server.js"
```

## Command Timing and Timeouts

| Command | Typical Time | Recommended Timeout | Status |
|---------|-------------|-------------------|--------|
| `npm install` | ~20 seconds | 120 seconds | ✅ Works |
| `npm run lint` | ~1 second | 30 seconds | ✅ Works |
| `npm run build` | ~2 seconds | 60 seconds | ✅ Works |
| `npm test` | ~7 seconds | 120 seconds | ✅ Works |
| `npm run dev` | ~3 seconds to start | 60 seconds | ✅ Works |
| `npm run db:generate` | N/A | N/A | ❌ Fails (network) |
| `docker compose up -d` | 10+ minutes | 15+ minutes | ❌ Fails (network) |

**NEVER CANCEL** any build or test commands. If a command appears to hang, wait the full timeout period.

## Project Structure

```
/home/runner/work/new/new/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── health/       # Health check endpoints
│   │   ├── nft/         # NFT minting and listing
│   │   └── collections/ # NFT collections management
│   ├── config/          # Environment configuration
│   │   └── env.ts       # Environment variables schema
│   ├── types/           # TypeScript type definitions
│   ├── __tests__/       # Jest test files
│   ├── app.ts          # Fastify app setup
│   └── server.ts       # Server entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
│       └── ci.yml      # Build and test pipeline
├── dist/               # Production build output
├── package.json        # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest test configuration
├── .eslintrc.js       # ESLint configuration
├── docker-compose.yml # Docker services
├── Dockerfile         # Container build
├── README.md          # Project documentation
└── QUICKSTART.md      # Quick setup guide
```

## Key Information

### Environment Requirements
- **Node.js**: 18+ (verified working with v20.19.4)
- **npm**: 10+ (verified working with v10.8.2)
- **PostgreSQL**: Required for database operations (not available in sandbox)
- **Redis**: Required for caching (not available in sandbox)
- **Docker**: Optional, for containerized setup

### Environment Variables
Required in `.env` file (copy from `.env.example`):
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/new_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### Tech Stack
- **Framework**: Fastify 4.24+
- **Language**: TypeScript 5.2+
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript support
- **Validation**: Zod for schema validation

### API Endpoints (All Working)
- `GET /health` - Health check (always works)
- `POST /nft/mint` - Mint NFT (stubbed, always works)
- `POST /nft/list` - List NFT (stubbed, always works)
- `POST /collections/mint` - Create collection (stubbed)
- `POST /collections/:id/items` - Add item to collection (stubbed)
- `GET /collections/:id/stats` - Get collection stats (stubbed)

### Known Limitations in Sandboxed Environments
1. **Prisma client generation** - requires network access to download Prisma engines
2. **Docker builds** - require network access for package downloads
3. **Database operations** - require running PostgreSQL and Redis services
4. **Real NFT operations** - endpoints are stubbed for development

### CI/CD Pipeline
The repository includes GitHub Actions in `.github/workflows/ci.yml`:
- **Test job**: Runs linting, builds, tests (requires PostgreSQL/Redis services)
- **Build job**: Creates and pushes Docker images to GitHub Container Registry
- **Platforms**: Supports linux/amd64 and linux/arm64

### Common Development Tasks
- **Add new API endpoint**: Create routes in `src/modules/{module}/routes.ts`
- **Add database model**: Update `prisma/schema.prisma`, run `npm run db:generate`
- **Add tests**: Create `*.test.ts` files in `src/__tests__/`
- **Update environment**: Modify `src/config/env.ts` and `.env.example`

### Troubleshooting
- **TypeScript version warning**: Can be ignored, ESLint works fine
- **Prisma client missing**: Use pre-generated client in `node_modules/.prisma/client`
- **Port 3000 in use**: Change PORT in `.env` or stop existing processes
- **Docker build fails**: Likely due to network restrictions in sandbox environment