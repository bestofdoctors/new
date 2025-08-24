# NFT Backend API

A production-ready TypeScript backend built with Fastify for NFT minting and listing operations.

## 🚀 Features

- **Fast & Lightweight**: Built on Fastify for high performance
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis integration ready
- **Containerized**: Docker & docker-compose setup
- **CI/CD**: GitHub Actions with automated testing and Docker image publishing
- **Production Ready**: Includes health checks, error handling, and security headers

## 📋 API Endpoints

### Health Check
```
GET /health
Response: { "ok": true }
```

### NFT Operations
```
POST /nft/mint
Body: {
  "tokenId": "string",
  "metadata": {} // optional
}
Response: {
  "success": true,
  "data": {
    "mintId": "string",
    "status": "pending"
  }
}

POST /nft/list  
Body: {
  "tokenId": "string",
  "price": "string", // BigInt as string in smallest currency unit
  "currency": "ETH", // optional
  "expiresAt": "ISO datetime" // optional
}
Response: {
  "success": true,
  "data": {
    "listingId": "string",
    "status": "active",
    "price": "string"
  }
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Jest
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for containerized setup)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd new
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Start all services**
```bash
docker-compose up -d
```

This starts:
- API server on port 3000
- PostgreSQL on port 5432  
- Redis on port 6379

2. **Run database migrations**
```bash
docker-compose exec api npm run db:migrate
```

3. **View logs**
```bash
docker-compose logs -f api
```

4. **Stop services**
```bash
docker-compose down
```

### Building Docker Image Manually

```bash
# Build the image
docker build -t nft-backend .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/db" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="your-secret" \
  nft-backend
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
src/
├── modules/          # Feature modules
│   ├── health/       # Health check routes
│   └── nft/          # NFT-related routes
├── config/           # Configuration files
├── types/            # TypeScript type definitions
├── __tests__/        # Test files
├── app.ts            # Fastify app setup
└── server.ts         # Server entry point

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

.github/
└── workflows/        # GitHub Actions CI/CD
```

## 🗄️ Database Schema

The application includes three main models:

- **Users**: User accounts and authentication
- **Mints**: NFT minting records and status tracking
- **Listings**: Marketplace listings with pricing and expiration

See `prisma/schema.prisma` for the complete schema definition.

## 🚀 Deployment

### GitHub Actions

The repository includes automated CI/CD with GitHub Actions:

1. **Testing**: Runs on every PR and push
2. **Docker Build**: Builds and pushes images to GitHub Container Registry
3. **Multi-platform**: Supports AMD64 and ARM64 architectures

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Set production environment variables**
```bash
export NODE_ENV=production
export DATABASE_URL="your-production-database-url"
export REDIS_URL="your-production-redis-url"
export JWT_SECRET="your-production-jwt-secret"
```

3. **Run database migrations**
```bash
npm run db:migrate
```

4. **Start the server**
```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |

## 🔒 Security

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests  
- **Validation**: Input validation with Zod schemas
- **Environment**: Secure environment variable handling

## 📈 Monitoring & Health Checks

- **Health endpoint**: `GET /health` for load balancer checks
- **Docker health checks**: Built-in container health monitoring
- **Structured logging**: JSON formatted logs in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.