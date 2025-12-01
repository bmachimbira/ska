# Docker Deployment Guide

This guide covers deploying the SDA App using Docker Compose with Caddy as a reverse proxy.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Database Migrations](#database-migrations)
- [Backup & Restore](#backup--restore)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Scaling](#scaling)

## Architecture Overview

The deployment consists of the following services:

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────┐
│          Caddy (Reverse Proxy)          │
│  - SSL/TLS termination                  │
│  - Load balancing                       │
│  - Rate limiting                        │
└─────┬───────┬───────┬──────────────────┘
      │       │       │
      │       │       └──────────┐
      │       │                  │
┌─────▼──┐ ┌──▼────────┐ ┌──────▼──────┐
│Backend │ │  Website  │ │ Admin Panel │
│  API   │ │(Next.js)  │ │  (Next.js)  │
└─────┬──┘ └───────────┘ └─────────────┘
      │
┌─────┴────────┬─────────┬────────┐
│              │         │        │
┌─────▼──┐ ┌───▼───┐ ┌───▼───┐   │
│Postgres│ │ Redis │ │ MinIO │   │
└────────┘ └───────┘ └───────┘   │
```

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 22.04 LTS or later (recommended)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB+ (depends on media storage needs)
- **Network**: Public IP address, ports 80 and 443 open

### Software Requirements

- Docker Engine 24.0+
- Docker Compose 2.20+
- Git (for deployment)

### Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Quick Start

### Development Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd ska
```

2. **Copy development environment file**

```bash
cp .env.development .env
```

3. **Start all services**

```bash
docker compose up -d
```

4. **Check service status**

```bash
docker compose ps
```

5. **Access services**

- Backend API: http://localhost:3000
- Website: http://localhost:3200
- Admin Panel: http://localhost:3100
- MinIO Console: http://localhost:9001

6. **Run database migrations**

```bash
docker compose exec backend npm run migrate
```

7. **View logs**

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

## Production Deployment

### 1. Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Create deployment directory
mkdir -p /opt/ska
cd /opt/ska

# Clone repository
git clone <your-repo-url> .
```

### 2. Environment Configuration

```bash
# Copy and edit production environment file
cp .env.example .env
nano .env
```

**Critical settings to update:**

```bash
# Domain Configuration
ROOT_DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
ADMIN_DOMAIN=admin.yourdomain.com
WEBSITE_DOMAIN=www.yourdomain.com
STORAGE_DOMAIN=storage.yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database
POSTGRES_PASSWORD=<strong-random-password>

# Redis
REDIS_PASSWORD=<strong-random-password>

# MinIO
MINIO_ROOT_PASSWORD=<strong-random-password>

# JWT
JWT_SECRET=<64-character-random-string>

# NextAuth
NEXTAUTH_SECRET=<32-character-random-string>
BACKEND_API_KEY=<random-api-key>

# API Keys (add your actual keys)
MUX_TOKEN_ID=<your-mux-token-id>
MUX_TOKEN_SECRET=<your-mux-token-secret>
OPENAI_API_KEY=<your-openai-api-key>
```

**Generate secure secrets:**

```bash
# JWT Secret (64 chars)
openssl rand -base64 64

# NextAuth Secret (32 chars)
openssl rand -base64 32

# Password (32 chars)
openssl rand -base64 32
```

### 3. DNS Configuration

Point your domains to your server's IP address:

```
A     yourdomain.com              → your-server-ip
A     www.yourdomain.com          → your-server-ip
A     api.yourdomain.com          → your-server-ip
A     admin.yourdomain.com        → your-server-ip
A     storage.yourdomain.com      → your-server-ip
A     minio.yourdomain.com        → your-server-ip (optional)
```

### 4. Build and Deploy

```bash
# Build images
docker compose build --no-cache

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Initialize Database

```bash
# Run migrations
docker compose exec backend npm run migrate

# Load seed data (includes all current content and users)
docker compose exec backend npm run seed
```

**About Seed Data:**

The seed script will automatically load data from `backend/seeds/initial_data.sql` if it exists. This file contains a dump of your current database and includes:
- User accounts and authentication
- Churches and locations
- Sermons, devotionals, and quarterlies
- Events and causes
- All content and relationships

To update the seed data from your development database:

```bash
# In your development environment
./scripts/dump-seed-data.sh
```

This will create/update `backend/seeds/initial_data.sql` with your current database state.

### 6. Initialize MinIO

```bash
# Create bucket (if not auto-created)
docker compose exec backend node -e "
const Minio = require('minio');
const client = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});
client.makeBucket('sda-media', 'us-east-1', (err) => {
  if (err) console.log('Bucket exists or error:', err);
  else console.log('Bucket created');
});
"
```

## Configuration

### Environment Variables

All configuration is done through environment variables in `.env` file.

**Key sections:**

1. **Domain Configuration** - Update with your actual domains
2. **Database** - PostgreSQL credentials
3. **Redis** - Cache configuration
4. **MinIO** - Object storage
5. **JWT** - Authentication secrets
6. **API Keys** - Third-party services (Mux, OpenAI, etc.)

See `.env.example` for all available options.

### Caddy Configuration

The `Caddyfile` defines reverse proxy rules, SSL, and security headers.

**Key features:**

- Automatic SSL/TLS with Let's Encrypt
- HTTP/2 and HTTP/3 support
- Security headers (HSTS, CSP, etc.)
- Compression (gzip, zstd)
- Health checks
- Request logging

**Customize domains:**

Edit `Caddyfile` if you need different domain structures or additional security settings.

## SSL/TLS Setup

Caddy automatically obtains and renews SSL certificates from Let's Encrypt.

### Automatic SSL (Recommended)

No configuration needed! Caddy will:
1. Automatically obtain certificates for all configured domains
2. Renew certificates before expiration
3. Redirect HTTP to HTTPS

### Requirements

- Valid DNS records pointing to your server
- Ports 80 and 443 accessible from the internet
- Valid email in `ACME_EMAIL` environment variable

### Verify SSL

```bash
# Check certificate
curl -vI https://api.yourdomain.com

# Check Caddy logs
docker compose logs caddy | grep -i "certificate"
```

### Custom Certificates

To use custom certificates, mount them in `docker-compose.yml`:

```yaml
caddy:
  volumes:
    - ./certs:/certs:ro
```

And update `Caddyfile`:

```
yourdomain.com {
  tls /certs/cert.pem /certs/key.pem
  # ... rest of config
}
```

## Database Migrations

### Running Migrations

```bash
# Run all pending migrations
docker compose exec backend npm run migrate

# Create new migration
docker compose exec backend npm run migrate:create -- migration_name

# Rollback last migration
docker compose exec backend npm run migrate:rollback
```

### Migration Files

Located in `backend/migrations/`. Each file is numbered sequentially.

### Backup Before Migrations

Always backup before running migrations in production:

```bash
./scripts/backup-database.sh
docker compose exec backend npm run migrate
```

## Backup & Restore

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use pg_dumpall for all databases
docker compose exec postgres pg_dumpall -U $POSTGRES_USER > backup_all_$(date +%Y%m%d_%H%M%S).sql
```

### Database Restore

```bash
# Restore from backup
cat backup_20231201_120000.sql | docker compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB
```

### MinIO Backup

```bash
# Backup MinIO data
docker compose exec minio mc mirror /data /backup

# Or copy volume
docker run --rm -v sda_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz /data
```

### Automated Backups

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /opt/ska && ./scripts/backup-all.sh
```

**Create backup script** (`scripts/backup-all.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/ska"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T postgres pg_dumpall -U $POSTGRES_USER | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup MinIO
docker run --rm -v sda_minio_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/minio_$DATE.tar.gz /data

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
chmod +x scripts/backup-all.sh
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f caddy

# Last 100 lines
docker compose logs --tail=100 backend

# Since specific time
docker compose logs --since 2024-01-01T00:00:00
```

### Log Rotation

Caddy logs are automatically rotated (see Caddyfile).

For Docker logs, configure in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Health Checks

```bash
# Check all services health
docker compose ps

# Manual health check
curl http://localhost:3000/health
curl http://localhost:3200/api/health
curl http://localhost:3100/api/health
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
```

### Sentry Integration

Configure `SENTRY_DSN` in `.env` to send errors to Sentry.

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs service-name

# Check configuration
docker compose config

# Restart service
docker compose restart service-name

# Rebuild and restart
docker compose up -d --build service-name
```

### Database Connection Issues

```bash
# Check if database is ready
docker compose exec postgres pg_isready -U $POSTGRES_USER

# Check connection from backend
docker compose exec backend node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows); pool.end(); });"
```

### SSL Certificate Issues

```bash
# Check Caddy logs
docker compose logs caddy | grep -i error

# Verify DNS
dig api.yourdomain.com

# Test ACME challenge
curl http://api.yourdomain.com/.well-known/acme-challenge/test
```

### Out of Disk Space

```bash
# Clean up unused resources
docker system prune -a --volumes

# Check specific volumes
docker volume ls
docker volume inspect sda_postgres_data

# Remove old images
docker image prune -a
```

### Memory Issues

```bash
# Check memory usage
docker stats

# Limit container memory in docker-compose.yml:
services:
  backend:
    mem_limit: 512m
    memswap_limit: 1g
```

## Scaling

### Horizontal Scaling

To run multiple backend instances:

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    # ... rest of config
```

Update Caddy to load balance:

```
{$API_DOMAIN} {
  reverse_proxy backend:3000 {
    lb_policy least_conn
    health_uri /health
  }
}
```

### Vertical Scaling

Increase resources:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Scaling

For larger deployments:

1. Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
2. Update `DATABASE_URL` in `.env`
3. Remove `postgres` service from `docker-compose.yml`

### Storage Scaling

For production media storage:

1. Use S3-compatible storage (AWS S3, Backblaze B2, etc.)
2. Update MinIO environment variables or switch to S3
3. Consider using Cloudflare R2 for zero egress costs

## Maintenance

### Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Run migrations
docker compose exec backend npm run migrate
```

### Security Updates

```bash
# Update base images
docker compose pull

# Rebuild with latest
docker compose up -d --build --force-recreate
```

## Production Checklist

Before going live:

- [ ] All domains configured in DNS
- [ ] SSL certificates obtained (automatic)
- [ ] All secrets changed from defaults
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Rate limiting configured
- [ ] Firewall rules set (allow only 80, 443, SSH)
- [ ] SSH key authentication only (disable password)
- [ ] Regular security updates scheduled
- [ ] Backup restoration tested
- [ ] Load testing performed
- [ ] Error tracking (Sentry) configured

## Support

For issues or questions:

- GitHub Issues: [repository-issues-url]
- Documentation: [docs-url]
- Email: admin@yourdomain.com

## License

[Your License]
