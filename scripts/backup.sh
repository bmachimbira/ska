#!/bin/bash
# Backup script for SDA App

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📦 Starting backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Source environment variables
if [ -f .env ]; then
    source .env
fi

POSTGRES_USER="${POSTGRES_USER:-user}"
POSTGRES_DB="${POSTGRES_DB:-sda_app}"

# Backup PostgreSQL
echo "💾 Backing up PostgreSQL database..."
docker compose exec -T postgres pg_dumpall -U "$POSTGRES_USER" | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL backup completed${NC}"
else
    echo -e "${RED}✗ PostgreSQL backup failed${NC}"
    exit 1
fi

# Backup MinIO data
echo "💾 Backing up MinIO data..."
docker run --rm \
    -v sda_minio_data:/data:ro \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine tar czf "/backup/minio_$DATE.tar.gz" -C /data .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MinIO backup completed${NC}"
else
    echo -e "${YELLOW}⚠ MinIO backup failed (non-critical)${NC}"
fi

# Backup environment file
echo "💾 Backing up .env file..."
if [ -f .env ]; then
    cp .env "$BACKUP_DIR/env_$DATE"
    echo -e "${GREEN}✓ Environment backup completed${NC}"
fi

# Calculate sizes
DB_SIZE=$(du -h "$BACKUP_DIR/postgres_$DATE.sql.gz" | cut -f1)
if [ -f "$BACKUP_DIR/minio_$DATE.tar.gz" ]; then
    MINIO_SIZE=$(du -h "$BACKUP_DIR/minio_$DATE.tar.gz" | cut -f1)
else
    MINIO_SIZE="N/A"
fi

# Clean up old backups
echo "🗑️  Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "minio_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "env_*" -mtime +"$RETENTION_DAYS" -delete

echo ""
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo ""
echo "Backup details:"
echo "  • Location: $BACKUP_DIR"
echo "  • Date: $DATE"
echo "  • PostgreSQL: $DB_SIZE"
echo "  • MinIO: $MINIO_SIZE"
echo ""
echo "Restore with: ./scripts/restore.sh $BACKUP_DIR/postgres_$DATE.sql.gz"
