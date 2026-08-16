# Production Deployment & Infrastructure Guide

## 1. Deployment Topology & Architecture

The self-hosted ADIKT ecommerce platform is containerized using Docker and orchestrated via Docker Compose or Kubernetes on any standard Linux VPS (Ubuntu 22.04 / 24.04 LTS on AWS, DigitalOcean, Hetzner, or Bare Metal).

```
                      [ Internet Traffic: HTTPS (Port 443) ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │ Caddy / Nginx Reverse Proxy           │
                     │ (Auto TLS / SSL via Let's Encrypt)    │
                     └───────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼ (Port 3000)                                   ▼ (Port 9000)
    ┌─────────────────────────┐                     ┌─────────────────────────┐
    │ Next.js Storefront      │                     │ Medusa v2 Commerce Core │
    │ (Container: adikt-store)│                     │ (Container: adikt-api)  │
    └────────────┬────────────┘                     └────────────┬────────────┘
                 │                                               │
                 │ (Internal Docker Network: 172.20.0.0/16)      │
                 └───────────────────────┬───────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
            ┌─────────────────────────┐     ┌─────────────────────────┐
            │ PostgreSQL 16 DB        │     │ Redis 7 In-Memory Cache │
            │ (Container: adikt-db)   │     │ (Container: adikt-redis)│
            └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Docker Compose Production Configuration

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  # 1. PostgreSQL 16 Database
  postgres:
    image: postgres:16-alpine
    container_name: adikt_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-adikt_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-adikt_commerce}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - adikt_internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-adikt_admin} -d ${POSTGRES_DB:-adikt_commerce}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Redis 7 Cache & Event Bus
  redis:
    image: redis:7-alpine
    container_name: adikt_redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - adikt_internal
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3. Medusa v2 Backend Core
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: adikt_backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    env_file:
      - ./backend/.env.production
    networks:
      - adikt_internal
    ports:
      - "127.0.0.1:9000:9000"

  # 4. Next.js 15 Customer Storefront
  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    container_name: adikt_storefront
    restart: always
    depends_on:
      - backend
    env_file:
      - ./storefront/.env.production
    networks:
      - adikt_internal
    ports:
      - "127.0.0.1:3000:3000"

  # 5. Caddy Web Server (Automated Reverse Proxy & SSL)
  caddy:
    image: caddy:2-alpine
    container_name: adikt_caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - adikt_internal
    depends_on:
      - storefront
      - backend

volumes:
  postgres_data:
  redis_data:
  caddy_data:
  caddy_config:

networks:
  adikt_internal:
    driver: bridge
```

---

## 3. Caddyfile (Reverse Proxy & Edge Config)

```caddyfile
# Storefront Domain
adiktclothing.com, www.adiktclothing.com {
    encode gzip zstd

    # Security Headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    reverse_proxy storefront:3000
}

# API & Medusa Admin Domain
api.adiktclothing.com {
    encode gzip zstd

    # Webhook path without body size limits
    @webhooks path /api/webhooks/*
    handle @webhooks {
        reverse_proxy backend:9000
    }

    handle {
        reverse_proxy backend:9000
    }
}
```

---

## 4. Multi-Stage Dockerfiles

### 4.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts

EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

CMD ["npx", "medusa", "start"]
```

### 4.2 Storefront Dockerfile (`storefront/Dockerfile`)
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 5. Zero-Downtime Migration & Deployment Script

```bash
#!/bin/bash
set -e

echo "🚀 Starting ADIKT Deployment Sequence..."

# 1. Pull latest code
git pull origin main

# 2. Run Database Migrations
echo "📦 Running Medusa v2 Migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npx medusa db:migrate

# 3. Build updated images
echo "🔨 Building Application Images..."
docker-compose -f docker-compose.prod.yml build

# 4. Rolling restart containers
echo "🔄 Rolling reload..."
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. Verify Health Check
echo "🔍 Verifying API Health..."
sleep 5
curl -f http://localhost:9000/health && echo "✅ API is Healthy!"
curl -f http://localhost:3000/api/health && echo "✅ Storefront is Healthy!"

echo "🎉 Deployment Completed Successfully!"
```

---

## 6. Monitoring & Health Checks

1. **Backend Health Endpoint**: `GET /health` returns `{ "status": "ok", "db": true, "redis": true }`.
2. **Logging**: Structured JSON logging using Pino for log aggregation via Loki / Datadog / CloudWatch.
3. **Alerting**: Automated alerts sent to `ops@adiktclothing.com` if error rates exceed 0.5% or payment webhook failures occur.
