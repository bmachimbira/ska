# Multi-stage build for Expo web app
FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_APP_NAME

# Copy shared package first
COPY shared /shared

# Build shared package
WORKDIR /shared
RUN npm ci && npm run build

# Switch to mobile app directory
WORKDIR /app

# Copy mobile package files and config
COPY mobile/package*.json ./
COPY mobile/tsconfig.json* ./
COPY mobile/app.json ./app.json

# Install dependencies
RUN npm ci

# Fix the shared package link - remove symlink and copy actual built files
RUN rm -rf node_modules/@ska/shared && \
    mkdir -p node_modules/@ska/shared && \
    cp /shared/package.json node_modules/@ska/shared/ && \
    cp -r /shared/dist node_modules/@ska/shared/ && \
    if [ -d /shared/node_modules ]; then cp -r /shared/node_modules node_modules/@ska/shared/; fi

# Copy mobile source code (excluding node_modules)
COPY mobile/app ./app
COPY mobile/assets ./assets
COPY mobile/components ./components
COPY mobile/constants ./constants
COPY mobile/lib ./lib

# Set environment variables for build
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_APP_NAME=$EXPO_PUBLIC_APP_NAME

# Build for web
RUN npx expo export -p web

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY mobile/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8081 (to match the Caddyfile config)
EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
