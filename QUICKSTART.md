# Quick Start Guide

## Development Setup (5 minutes)

1. **Clone and setup**
```bash
git clone <repository-url>
cd new
npm install
cp .env.example .env
# Edit .env with your database URLs
```

2. **Start with Docker (recommended)**
```bash
docker-compose up -d
# Wait for services to start, then:
docker-compose exec api npm run db:push
```

3. **Or start locally**
```bash
# Make sure PostgreSQL and Redis are running
npm run db:push
npm run dev
```

4. **Test it works**
```bash
curl http://localhost:3000/health
# Should return: {"ok":true}
```

## Production Deployment

1. **Environment Variables (required)**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-256-bit-secret
PORT=3000
```

2. **Deploy with Docker**
```bash
docker build -t nft-backend .
docker run -p 3000:3000 --env-file .env nft-backend
```

3. **Or deploy manually**
```bash
npm run build
npm run db:migrate
npm start
```

## API Usage Examples

```bash
# Health check
curl http://localhost:3000/health

# Mint NFT (stub)
curl -X POST http://localhost:3000/nft/mint \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "nft-001", "metadata": {"name": "My NFT"}}'

# List NFT (stub)  
curl -X POST http://localhost:3000/nft/list \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "nft-001", "price": "1500000000000000000", "currency": "ETH"}'
```
