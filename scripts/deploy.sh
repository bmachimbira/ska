#!/bin/bash
# Deployment script for SDA App

set -e

echo "🚀 Starting SDA App deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Source environment variables
source .env

# Check required variables
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "NEXTAUTH_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env${NC}"
        exit 1
    fi
done

# Check if running as root for production
if [ "$NODE_ENV" == "production" ] && [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}Warning: Running as root. Consider using a non-root user with docker group.${NC}"
fi

echo "📦 Building Docker images..."
docker compose build --no-cache

echo "🔄 Stopping existing containers..."
docker compose down

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
services=("postgres" "redis" "minio" "backend")
all_healthy=true

for service in "${services[@]}"; do
    echo -n "Checking $service... "
    if docker compose ps "$service" | grep -q "healthy\|Up"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        all_healthy=false
    fi
done

if [ "$all_healthy" = false ]; then
    echo -e "${RED}Some services are not healthy. Check logs with: docker compose logs${NC}"
    exit 1
fi

echo "📊 Running database migrations..."
docker compose exec -T backend npm run migrate

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Services are running:"
echo "  • Backend API: http://localhost:${BACKEND_PORT:-3000}"
echo "  • Website: http://localhost:${WEBSITE_PORT:-3200}"
echo "  • Admin Panel: http://localhost:${ADMIN_PORT:-3100}"
echo "  • MinIO Console: http://localhost:${MINIO_CONSOLE_PORT:-9001}"
echo ""
echo "View logs with: docker compose logs -f"
echo "Check status with: docker compose ps"
