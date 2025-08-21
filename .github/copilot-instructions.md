# NFT Backend API Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search or bash commands only when you encounter unexpected information that does not match the info documented here.**

## Working Effectively

### Bootstrap, Build, and Test Repository
Execute these commands in sequence to set up the development environment:

```bash
# 1. Install dependencies - takes ~20 seconds, NEVER CANCEL
npm install

# 2. Copy environment configuration
cp .env.example .env
# Edit .env with your database URLs if needed

# 3. Build TypeScript code - takes ~2 seconds
npm run build

# 4. Run tests - takes ~7 seconds, NEVER CANCEL
npm test

# 5. Run linting - takes ~1 second
npm run lint
```

**CRITICAL TIMING NOTES:**
- `npm install`: Set timeout to 60+ seconds. NEVER CANCEL.
- `npm run build`: Set timeout to 30+ seconds. Takes ~2 seconds typically.
- `npm test`: Set timeout to 30+ seconds. Takes ~7 seconds typically.
- `npm run lint`: Set timeout to 30+ seconds. Takes ~1 second typically.

### Start Development Server
```bash
# Start development server with hot reload
npm run dev
# Server starts on http://localhost:3000 within 3-5 seconds
# NEVER CANCEL - server runs continuously until manually stopped
```

### Database Operations
**WARNING**: Database operations may fail due to network restrictions in sandboxed environments.

```bash
# Generate Prisma client - MAY FAIL due to binary download restrictions
npm run db:generate

# Push schema to development database - requires working database connection
npm run db:push

# Run production migrations - requires working database connection  
npm run db:migrate

# Open Prisma Studio - requires working database connection
npm run db:studio
```

**Known Issue**: In restricted network environments, `npm run db:generate` fails with `ENOTFOUND binaries.prisma.sh`. This is documented limitation - tests still work as they mock database calls.

### Docker Operations
**WARNING**: Docker operations will fail in restricted network environments.

```bash
# Start all services with Docker (PostgreSQL, Redis, API) - MAY FAIL
docker compose up -d

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

**Known Issue**: Docker builds fail due to network restrictions accessing Alpine package repositories. Document this limitation but don't attempt to fix it.

## Manual Validation Scenarios

### ALWAYS Test These Scenarios After Making Changes:

1. **API Health Check**
   ```bash
   # Start dev server, then test:
   curl http://localhost:3000/health
   # Expected: {"ok":true}
   ```

2. **NFT Minting Workflow**
   ```bash
   # Valid request
   curl -X POST http://localhost:3000/nft/mint \
     -H "Content-Type: application/json" \
     -d '{"tokenId": "test-001", "metadata": {"name": "Test NFT"}}'
   # Expected: {"success":true,"data":{"mintId":"...","status":"pending"},"message":"NFT mint initiated successfully"}
   
   # Test validation error
   curl -X POST http://localhost:3000/nft/mint \
     -H "Content-Type: application/json" \
     -d '{}'
   # Expected: 400 error with validation details
   ```

3. **NFT Listing Workflow**  
   ```bash
   # Valid request
   curl -X POST http://localhost:3000/nft/list \
     -H "Content-Type: application/json" \
     -d '{"tokenId": "test-001", "price": "1.5", "currency": "ETH"}'
   # Expected: {"success":true,"data":{"listingId":"...","status":"active"}}
   ```

4. **Collections Workflow**
   ```bash
   # Mint collection
   curl -X POST http://localhost:3000/collections/mint \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Collection"}'
     
   # Add item to collection  
   curl -X POST http://localhost:3000/collections/[collection-id]/items \
     -H "Content-Type: application/json" \
     -d '{"item": {"name": "Item 1"}}'
     
   # Get collection stats
   curl -X GET http://localhost:3000/collections/[collection-id]/stats
   ```

### Pre-commit Validation
ALWAYS run these commands before committing changes:
```bash
npm run lint       # Fix linting issues
npm run build      # Ensure TypeScript compiles
npm test          # Ensure all tests pass
```

## Repository Structure and Key Files

### Source Code Organization
```
src/
├── modules/          # Feature modules
│   ├── health/       # Health check routes (/health)
│   ├── nft/         # NFT operations (/nft/mint, /nft/list)
│   └── collections/ # Collection operations (/collections/*)
├── config/          # Configuration files (env.ts)
├── types/           # TypeScript type definitions
├── __tests__/       # Jest test files (setup.ts, *.test.ts)
├── app.ts           # Fastify app setup with middleware
└── server.ts        # Server entry point
```

### Key Configuration Files
- `package.json`: Scripts and dependencies
- `tsconfig.json`: TypeScript configuration
- `jest.config.js`: Jest test configuration  
- `.eslintrc.js`: ESLint rules and configuration
- `prisma/schema.prisma`: Database schema (Users, Mints, Listings, Collections)
- `docker-compose.yml`: Multi-service setup (API, PostgreSQL, Redis)
- `.env.example`: Environment variable template

### GitHub Actions
- `.github/workflows/ci.yml`: Runs tests, linting, build, and Docker image creation
- CI pipeline runs on push to main/develop branches and PRs

## Environment Variables

Required variables (copy from .env.example):
```
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/new_db"  
REDIS_URL="redis://localhost:6379"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## API Endpoints Reference

### Health Check
- `GET /health` → `{"ok": true}`

### NFT Operations  
- `POST /nft/mint` → Mint NFT (requires: tokenId, optional: metadata)
- `POST /nft/list` → List NFT for sale (requires: tokenId, price, optional: currency, expiresAt)

### Collections Operations
- `POST /collections/mint` → Create collection (requires: name)
- `POST /collections/{id}/items` → Add item to collection (requires: item)
- `GET /collections/{id}/stats` → Get collection statistics

## Troubleshooting Common Issues

### TypeScript Version Warning
ESLint shows warning about TypeScript 5.9.2 not being officially supported. This is non-blocking - linting still works correctly.

### Network Restrictions
In sandboxed environments:
- Prisma binary downloads fail (`npm run db:generate`)
- Docker image pulls may timeout
- External API calls blocked
Document these limitations but proceed with available functionality.

### Database Connection Issues
If database is not available:
- Tests still pass (they use mocks)
- API returns appropriate errors for database operations
- Development server starts but database operations fail gracefully

## Testing Notes

- Tests use Jest with TypeScript support
- All tests mock external dependencies (RPC calls, database)
- Test setup in `src/__tests__/setup.ts` configures test environment
- Tests validate API contract and error handling
- Coverage reports available with `jest --coverage` (not in package.json scripts)

## Performance Characteristics

Based on validation testing:
- Cold start (npm install): ~20 seconds
- TypeScript build: ~2 seconds  
- Test suite execution: ~7 seconds
- Development server startup: ~3-5 seconds
- Linting: ~1 second

Always use appropriate timeouts and expect these baseline timing in instructions and validation.