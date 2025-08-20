# ===== Builder =====
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ===== Production =====
FROM node:18-alpine AS production
WORKDIR /app
# Prisma/Node runtime bağımlılıkları
RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build çıktısı ve Prisma dosyaları
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# İzinler
RUN mkdir -p /app/node_modules/@prisma/engines && chown -R node:node /app

USER node
CMD ["node", "dist/server.js"]
