# Multi-stage build for production
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache wget

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Clean node_modules to avoid platform conflicts
RUN rm -rf client/node_modules server/node_modules

# Reinstall dependencies in the container
WORKDIR /app
RUN npm ci

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Build client
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/

# Install production dependencies
WORKDIR /app/server
RUN npm ci --only=production && npm cache clean --force
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/server/prisma && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server/index.js"]
