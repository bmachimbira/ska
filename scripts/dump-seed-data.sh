#!/bin/bash
# Script to dump the current database as seed data

set -e

echo "📦 Dumping current database as seed data..."

# Check if docker-compose is running
if ! docker compose -f docker-compose.dev.yml ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL container is not running"
    echo "Start it with: docker compose -f docker-compose.dev.yml up -d postgres"
    exit 1
fi

# Create seeds directory if it doesn't exist
mkdir -p backend/seeds

echo ""
echo "Creating two types of dumps:"
echo "  1. data_only.sql - Data without schema (RECOMMENDED for production)"
echo "  2. full_dump.sql - Complete database with schema (for reference)"
echo ""

# Dump data only (safer for production after migrations)
echo "📝 Creating data-only dump..."
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump \
    -U user \
    --data-only \
    --column-inserts \
    --no-owner \
    --no-privileges \
    sda_app > backend/seeds/data_only.sql

# Dump full database (for reference)
echo "📝 Creating full dump..."
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump \
    -U user \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    sda_app > backend/seeds/full_dump.sql

# Check if dumps were successful
if [ $? -eq 0 ]; then
    DATA_LINES=$(wc -l < backend/seeds/data_only.sql)
    FULL_LINES=$(wc -l < backend/seeds/full_dump.sql)
    
    echo ""
    echo "✅ Database dumped successfully!"
    echo ""
    echo "Files created:"
    echo "  📄 backend/seeds/data_only.sql ($DATA_LINES lines)"
    echo "     → Use this for production (after running migrations)"
    echo ""
    echo "  📄 backend/seeds/full_dump.sql ($FULL_LINES lines)"  
    echo "     → Complete database for reference/backup"
    echo ""
    echo "⚠️  Note: data_only.sql should be loaded AFTER running migrations"
    echo "   1. Run migrations: docker compose exec backend npm run migrate"
    echo "   2. Load data: Load data_only.sql manually (not via seed script)"
    echo ""
else
    echo "❌ Database dump failed"
    exit 1
fi
