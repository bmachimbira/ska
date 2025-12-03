# Multi-stage build for Next.js admin panel
FROM node:20-alpine AS deps

# Copy and build shared package first
COPY shared /shared
WORKDIR /shared
RUN npm ci && npm run build

# Install admin-panel dependencies
WORKDIR /app
COPY admin-panel/package*.json ./
RUN npm ci

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /shared /shared

# Fix the shared package link - remove symlink and copy actual built files
RUN rm -rf node_modules/@ska/shared && \
    mkdir -p node_modules/@ska/shared && \
    cp /shared/package.json node_modules/@ska/shared/ && \
    cp -r /shared/dist node_modules/@ska/shared/ && \
    if [ -d /shared/node_modules ]; then cp -r /shared/node_modules node_modules/@ska/shared/; fi

COPY admin-panel/ .

# Set build-time environment variables
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files (check if public exists first)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))" || exit 1

CMD ["node", "server.js"]
