# =========================================================================
# Multi-Stage Dockerfile for Vaayu Full-Stack Platform (Backend + Frontend)
# =========================================================================

# Stage 1: Build Frontend UI
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY Frontend/ ./
RUN npm run build || npx vite build

# Stage 2: Build Backend Services
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY backend/ ./backend/
COPY api/ ./api/
COPY configuration/ ./configuration/

RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend & database schema
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/configuration ./configuration
COPY --from=backend-builder /app/backend/src/db/schema.sql ./dist/backend/src/db/schema.sql

# Copy compiled frontend SPA static assets
COPY --from=frontend-builder /app/frontend/dist/public ./Frontend/dist/public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/backend/src/server.js"]
