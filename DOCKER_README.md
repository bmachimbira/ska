# SDA App - Docker + Caddy Deployment

Complete Docker Compose setup with Caddy reverse proxy for the SDA App.

## What's Included

### Services
- **Backend API** (Node.js/TypeScript/Express)
- **Website** (Next.js)
- **Admin Panel** (Next.js)
- **PostgreSQL** (with pgvector)
- **Redis** (caching)
- **MinIO** (object storage)
- **Caddy** (reverse proxy with automatic SSL)

### Features
- 🔒 Automatic SSL/TLS certificates (Let's Encrypt)
- 🚀 Production-ready configurations
- 🔄 Health checks for all services
- 📊 Structured logging
- 🔐 Security headers and rate limiting
- 💾 Backup and restore scripts
- 📦 Volume management for data persistence
- 🌐 Multi-domain support

## Quick Start

### Development

```bash
# 1. Copy environment file
cp .env.development .env

# 2. Start services
docker compose up -d

# 3. Run migrations
docker compose exec backend npm run migrate

# 4. Access services
# Backend:  http://localhost:3000
# Website:  http://localhost:3200
# Admin:    http://localhost:3100
# MinIO:    http://localhost:9001
```

### Production

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Configure all variables

# 2. Deploy
./scripts/deploy.sh

# 3. Verify
docker compose ps
docker compose logs -f
```

## Documentation

- **[Full Deployment Guide](docs/DOCKER_DEPLOYMENT.md)** - Complete deployment instructions
- **[Quick Reference](DOCKER_QUICK_REF.md)** - Common commands and troubleshooting
- **[Environment Variables](.env.example)** - All configuration options

## Architecture

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │     Caddy      │  (Ports 80, 443)
              │ Reverse Proxy  │
              │   + SSL/TLS    │
              └────────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
│   Backend   │ │  Website   │ │Admin Panel  │
│  (Node.js)  │ │ (Next.js)  │ │  (Next.js)  │
└──────┬──────┘ └────────────┘ └─────────────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
┌──────▼──┐ ┌────▼────┐ ┌───▼────┐    │
│Postgres │ │  Redis  │ │ MinIO  │    │
└─────────┘ └─────────┘ └────────┘    │
                                       │
                         (Object Storage)
```

## File Structure

```
ska/
├── backend/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore
├── website/
│   ├── Dockerfile              # Website container
│   └── .dockerignore
├── admin-panel/
│   ├── Dockerfile              # Admin container
│   └── .dockerignore
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development overrides
├── Caddyfile                   # Reverse proxy config
├── .env.example                # Production env template
├── .env.development            # Development env template
├── scripts/
│   ├── deploy.sh              # Deployment script
│   ├── backup.sh              # Backup script
│   └── restore.sh             # Restore script
└── docs/
    └── DOCKER_DEPLOYMENT.md   # Full documentation
```

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Run migrations
docker compose exec backend npm run migrate

# Load seed data (your current database content)
docker compose exec backend npm run seed

# Backup
./scripts/backup.sh

# Update seed data from development
./scripts/dump-seed-data.sh

# Restore
./scripts/restore.sh backups/postgres_20240101.sql.gz

# Update
git pull
docker compose up -d --build
```

## Environment Configuration

Key variables to configure in `.env`:

```bash
# Domains
API_DOMAIN=api.yourdomain.com
ADMIN_DOMAIN=admin.yourdomain.com
WEBSITE_DOMAIN=www.yourdomain.com

# Secrets (generate with: openssl rand -base64 32)
POSTGRES_PASSWORD=<secure-password>
JWT_SECRET=<64-char-secret>
NEXTAUTH_SECRET=<32-char-secret>

# API Keys
MUX_TOKEN_ID=<your-mux-token>
OPENAI_API_KEY=<your-openai-key>
```

See `.env.example` for all available options.

## DNS Configuration

For production, configure these A records:

```
yourdomain.com              → your-server-ip
www.yourdomain.com          → your-server-ip
api.yourdomain.com          → your-server-ip
admin.yourdomain.com        → your-server-ip
storage.yourdomain.com      → your-server-ip
```

## SSL/TLS

Caddy automatically obtains SSL certificates from Let's Encrypt. Requirements:

- Valid DNS records
- Ports 80 and 443 accessible
- Valid email in `ACME_EMAIL`

## Backup Strategy

### Automated Backups

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /opt/ska && ./scripts/backup.sh
```

### Manual Backup

```bash
./scripts/backup.sh
```

Backups include:
- PostgreSQL database
- MinIO data
- Environment configuration

## Monitoring

### Health Checks

```bash
# All services
docker compose ps

# Specific endpoints
curl http://localhost:3000/health
curl http://localhost:3200/api/health
curl http://localhost:3100/api/health
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Logs
docker compose logs -f
```

## Security Checklist

Before going to production:

- [ ] Change all default passwords in `.env`
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Set up SSH key authentication
- [ ] Enable automatic security updates
- [ ] Configure backup rotation
- [ ] Test SSL configuration
- [ ] Review Caddy security headers
- [ ] Set up monitoring/alerting
- [ ] Test backup restoration
- [ ] Perform load testing

## Troubleshooting

### Services won't start
```bash
docker compose logs service-name
docker compose restart service-name
```

### Database connection issues
```bash
docker compose exec postgres pg_isready -U user
docker compose restart postgres
```

### SSL certificate issues
```bash
docker compose logs caddy | grep -i error
docker compose restart caddy
```

### Out of disk space
```bash
docker system prune -a
```

See [Full Documentation](docs/DOCKER_DEPLOYMENT.md) for more.

## Scaling

### Horizontal Scaling
Run multiple instances of services:

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Vertical Scaling
Increase resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Support

- **Issues**: [GitHub Issues]
- **Documentation**: [docs/](docs/)
- **Email**: admin@yourdomain.com

## License

[Your License]

---

**Quick Links:**
- [Full Deployment Guide](docs/DOCKER_DEPLOYMENT.md)
- [Quick Reference](DOCKER_QUICK_REF.md)
- [Main README](README.md)
