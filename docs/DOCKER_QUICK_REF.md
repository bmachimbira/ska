# Docker Deployment - Quick Reference

## Quick Commands

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart backend

# Rebuild and start
docker compose up -d --build
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Check Status

```bash
# Service status
docker compose ps

# Resource usage
docker stats

# Health checks
docker compose ps | grep healthy
```

### Database Operations

```bash
# Run migrations
docker compose exec backend npm run migrate

# Create migration
docker compose exec backend npm run migrate:create -- migration_name

# Rollback
docker compose exec backend npm run migrate:rollback

# Access PostgreSQL
docker compose exec postgres psql -U user sda_app

# Seed database
docker compose exec backend npm run seed
```

### Backup & Restore

```bash
# Create backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh ./backups/postgres_20240101_120000.sql.gz
```

### Deployment

```bash
# Full deployment
./scripts/deploy.sh

# Manual deployment
git pull
docker compose build --no-cache
docker compose up -d
docker compose exec backend npm run migrate
```

### Maintenance

```bash
# Clean up unused resources
docker system prune -a

# Update images
docker compose pull
docker compose up -d

# View disk usage
docker system df
```

## Service URLs

### Development
- Backend: http://localhost:3000
- Website: http://localhost:3200
- Admin: http://localhost:3100
- MinIO Console: http://localhost:9001

### Production
- Backend: https://api.yourdomain.com
- Website: https://www.yourdomain.com
- Admin: https://admin.yourdomain.com
- Storage: https://storage.yourdomain.com

## Health Check Endpoints

```bash
curl http://localhost:3000/health
curl http://localhost:3200/api/health
curl http://localhost:3100/api/health
```

## Troubleshooting

### Service won't start
```bash
docker compose logs service-name
docker compose restart service-name
docker compose up -d --build --force-recreate service-name
```

### Database connection issues
```bash
docker compose exec postgres pg_isready -U user
docker compose restart postgres
```

### SSL issues (Caddy)
```bash
docker compose logs caddy | grep -i error
docker compose restart caddy
```

### Out of disk space
```bash
docker system prune -a --volumes
docker volume prune
```

## Important Files

- `docker-compose.yml` - Service definitions
- `Caddyfile` - Reverse proxy configuration
- `.env` - Environment variables
- `backend/Dockerfile` - Backend image
- `website/Dockerfile` - Website image
- `admin-panel/Dockerfile` - Admin image

## Environment Variables

Required variables in `.env`:

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
MUX_TOKEN_ID=<mux-token>
MUX_TOKEN_SECRET=<mux-secret>
OPENAI_API_KEY=<openai-key>
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Configure firewall (allow 80, 443, SSH only)
- [ ] Set up SSH key authentication
- [ ] Enable automatic security updates
- [ ] Configure backup rotation
- [ ] Set up monitoring/alerting
- [ ] Review Caddy security headers
- [ ] Test SSL configuration
- [ ] Configure rate limiting

## Monitoring

### Resource Usage
```bash
# Container stats
docker stats

# Service health
docker compose ps

# Logs
docker compose logs -f
```

### Disk Space
```bash
df -h
docker system df
du -sh /var/lib/docker/volumes/*
```

### Database Size
```bash
docker compose exec postgres psql -U user -d sda_app -c "
SELECT pg_database.datname,
       pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;"
```

## Scaling

### Horizontal Scaling (Multiple Instances)
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Resource Limits
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

- Documentation: `docs/DOCKER_DEPLOYMENT.md`
- Issues: GitHub Issues
- Logs: `docker compose logs -f`
