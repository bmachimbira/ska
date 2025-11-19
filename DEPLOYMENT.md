# SDA Content App - Deployment Guide

Complete deployment guide for the SDA Content App across all platforms: Backend, Admin Panel, and Android App.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Admin Panel Deployment](#admin-panel-deployment)
- [Android App Release](#android-app-release)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts & Services

1. **Cloud Infrastructure**
   - Cloud provider account (AWS, GCP, Azure, or DigitalOcean)
   - PostgreSQL database (managed service recommended)
   - OR Supabase account (includes PostgreSQL + Auth)

2. **AI & ML Services**
   - OpenAI API key (for embeddings and chat)
   - OR Anthropic API key (alternative for chat)

3. **Android**
   - Google Play Console account
   - Google Cloud project for FCM (Firebase Cloud Messaging)

4. **Domain & SSL**
   - Domain name for API and admin panel
   - SSL certificates (Let's Encrypt recommended)

### Development Tools

- Node.js 18+ and npm
- PostgreSQL 15+ client
- Android Studio (for app builds)
- Git

---

## Backend Deployment

### Option 1: Traditional Server (Node.js)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Clone and Build

```bash
# Clone repository
git clone https://github.com/your-org/ska.git
cd ska/backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

#### 3. Environment Configuration

Create `.env` file:

```env
# Server
NODE_ENV=production
PORT=3001
API_BASE_URL=https://api.sda-content.app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sda_content
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# AI Services
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_API_KEY=your-admin-api-key

# CORS
CORS_ORIGIN=https://admin.sda-content.app,https://sda-content.app

# Optional: Media Storage
S3_BUCKET=sda-content-media
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

#### 4. Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

#### 5. Start with PM2

```bash
# Start application
pm2 start npm --name "sda-backend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit
```

#### 6. Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.sda-content.app;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.sda-content.app;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.sda-content.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sda-content.app/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase timeout for streaming responses
    location /v1/chat/query {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
        proxy_read_timeout 300s;
    }
}
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["npm", "start"]
```

#### 2. Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/sda_content
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=sda_content
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Admin Panel Deployment

### Vercel Deployment (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Configure Environment Variables

In Vercel dashboard or via CLI:

```env
NEXT_PUBLIC_APP_NAME=SDA Admin Panel
NEXT_PUBLIC_API_URL=https://api.sda-content.app/v1

NEXTAUTH_URL=https://admin.sda-content.app
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

BACKEND_API_URL=https://api.sda-content.app/v1
BACKEND_API_KEY=your-backend-api-key
```

#### 3. Deploy

```bash
cd admin-panel
vercel --prod
```

### Self-Hosted Deployment

#### 1. Build

```bash
cd admin-panel
npm install
npm run build
```

#### 2. Start with PM2

```bash
pm2 start npm --name "sda-admin" -- start
pm2 save
```

#### 3. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name admin.sda-content.app;

    ssl_certificate /etc/letsencrypt/live/admin.sda-content.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.sda-content.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Android App Release

### 1. Prepare Release Build

#### Update version in `build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### Create keystore:

```bash
keytool -genkey -v -keystore sda-release.keystore \
  -alias sda-key -keyalg RSA -keysize 2048 -validity 10000
```

#### Configure signing in `app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../sda-release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias 'sda-key'
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2. Build Release APK/AAB

```bash
# Build App Bundle (recommended for Play Store)
./gradlew bundleRelease

# OR build APK
./gradlew assembleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
# OR: app/build/outputs/apk/release/app-release.apk
```

### 3. Google Play Console Setup

1. **Create Application**
   - Go to Google Play Console
   - Create new app
   - Fill in app details

2. **Upload Build**
   - Go to Release > Production
   - Upload AAB file
   - Fill in release notes

3. **Store Listing**
   - Add screenshots (phone, tablet, TV if applicable)
   - Feature graphic (1024x500)
   - App description
   - Privacy policy URL

4. **Content Rating**
   - Complete questionnaire
   - Get ESRB/PEGI ratings

5. **Pricing & Distribution**
   - Set countries
   - Pricing (free/paid)
   - Content guidelines

### 4. Deep Link Verification

#### Upload `assetlinks.json` to website:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sda.app",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT"
    ]
  }
}]
```

Upload to: `https://sda-content.app/.well-known/assetlinks.json`

Get fingerprint:

```bash
keytool -list -v -keystore sda-release.keystore -alias sda-key
```

---

## Database Setup

### PostgreSQL with pgvector

#### 1. Install pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. Run Migrations

```bash
cd backend
npm run migrate
```

#### 3. Create Indexes

Migrations include indexes, but verify:

```sql
-- Vector similarity index
CREATE INDEX idx_rag_document_embedding ON rag_document
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Text search indexes
CREATE INDEX idx_sermon_title ON sermon USING gin(to_tsvector('english', title));
CREATE INDEX idx_devotional_content ON devotional USING gin(to_tsvector('english', content));
```

#### 4. Backup Strategy

```bash
# Daily backup
pg_dump -h localhost -U postgres -d sda_content -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h localhost -U postgres -d sda_content backup_20240615.dump
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | Yes | `3001` |
| `DATABASE_URL` | PostgreSQL connection | Yes | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | OpenAI API key | Yes* | `sk-...` |
| `JWT_SECRET` | JWT signing key | Yes | `min-32-chars` |
| `CORS_ORIGIN` | Allowed origins | Yes | `https://admin.example.com` |

### Admin Panel Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `https://api.example.com/v1` |
| `NEXTAUTH_URL` | Admin panel URL | Yes | `https://admin.example.com` |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes | `min-32-chars` |

---

## Monitoring & Maintenance

### Logging

**Backend Logging:**
- Use PM2 logs: `pm2 logs sda-backend`
- Rotate logs: `pm2 install pm2-logrotate`

**Database Monitoring:**
```sql
-- Check connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Health Checks

**Backend:**
```bash
curl https://api.sda-content.app/health
```

**Database:**
```bash
pg_isready -h localhost -p 5432
```

### Backups

**Database:** Daily automated backups with 30-day retention

**Media:** Replicate S3 bucket to different region

**Code:** Tagged releases in Git

### Updates

**Backend:**
```bash
git pull origin main
npm install
npm run build
pm2 restart sda-backend
```

**Admin Panel:**
```bash
vercel --prod
# OR
npm run build && pm2 restart sda-admin
```

**Android:** Release new version through Play Console

---

## Troubleshooting

### Backend Issues

**High memory usage:**
- Check connection pool size
- Review query performance
- Implement caching

**Slow RAG queries:**
- Verify pgvector indexes
- Reduce embedding dimensions
- Use hybrid search sparingly

### Database Issues

**Connection errors:**
- Check `max_connections` setting
- Verify connection pool configuration
- Review firewall rules

**Slow queries:**
- Analyze with `EXPLAIN ANALYZE`
- Add appropriate indexes
- Consider query optimization

### Android Issues

**Crash on startup:**
- Check ProGuard rules
- Verify API compatibility
- Review crash reports in Play Console

**Deep links not working:**
- Verify `assetlinks.json`
- Check App Links verification
- Test with adb: `adb shell am start -a android.intent.action.VIEW -d "https://sda-content.app/sermons/1"`

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled everywhere
- [ ] Database backups automated
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] JWT secrets rotated
- [ ] ProGuard enabled for Android
- [ ] API authentication enforced
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection headers set

---

## Support & Resources

- **Documentation:** https://github.com/your-org/ska/wiki
- **Issues:** https://github.com/your-org/ska/issues
- **Security:** security@sda-content.app

---

*Last updated: 2024-06*
