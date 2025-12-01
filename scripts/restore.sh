#!/bin/bash
# Restore script for SDA App

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file path required${NC}"
    echo "Usage: ./scripts/restore.sh <backup-file.sql.gz>"
    echo "Example: ./scripts/restore.sh ./backups/postgres_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Source environment variables
if [ -f .env ]; then
    source .env
fi

POSTGRES_USER="${POSTGRES_USER:-user}"
POSTGRES_DB="${POSTGRES_DB:-sda_app}"

echo -e "${YELLOW}⚠️  WARNING: This will restore the database from backup.${NC}"
echo -e "${YELLOW}   All current data will be replaced!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "📦 Restoring from: $BACKUP_FILE"

# Stop services
echo "🔄 Stopping services..."
docker compose stop backend website admin-panel

# Restore database
echo "💾 Restoring PostgreSQL database..."
gunzip < "$BACKUP_FILE" | docker compose exec -T postgres psql -U "$POSTGRES_USER"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"
    exit 1
fi

# Restart services
echo "🚀 Restarting services..."
docker compose up -d

echo ""
echo -e "${GREEN}✅ Restore completed successfully!${NC}"
echo ""
echo "Services are starting up. Check status with: docker compose ps"
