# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production dependencies stage
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built app from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --chown=nodejs:nodejs ./migrations ./migrations
COPY --chown=nodejs:nodejs ./scripts ./scripts
COPY --chown=nodejs:nodejs ./openapi ./openapi
COPY --chown=nodejs:nodejs ./seeds ./seeds
COPY --chown=nodejs:nodejs ./docker-entrypoint.sh ./docker-entrypoint.sh

# Copy data folder (if it exists) for import scripts
COPY --chown=nodejs:nodejs ../data ../data 2>/dev/null || true

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start application
CMD ["sh", "docker-entrypoint.sh"]
