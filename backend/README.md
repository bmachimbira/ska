# SKA Content App - Backend

> REST API and services for the SKA Content App

## Overview

The backend provides a RESTful API for content delivery, media management, search, and AI-powered study chat using RAG (Retrieval-Augmented Generation).

## Technology Stack

- **Runtime**: Node.js 20+ / TypeScript
- **Framework**: NestJS (or Supabase Edge Functions)
- **Database**: PostgreSQL 15+ with pgvector extension
- **ORM**: Prisma or Supabase Client
- **Storage**: Supabase Storage / S3
- **Streaming**: Mux or Cloudflare Stream
- **Search**: PostgreSQL Full-Text Search
- **AI**: OpenAI API / Anthropic API

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── content/        # Content management (sermons, devotionals, quarterlies)
│   │   ├── media/          # Media asset handling
│   │   ├── search/         # Full-text search
│   │   ├── chat/           # AI study chat (RAG)
│   │   └── admin/          # Admin endpoints
│   ├── common/
│   │   ├── dto/            # Data transfer objects
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Request interceptors
│   │   └── utils/          # Utilities
│   ├── database/
│   │   ├── entities/       # Database entities
│   │   └── migrations/     # Migration files
│   └── main.ts             # Application entry point
├── migrations/             # SQL migration files
├── openapi/                # OpenAPI/Swagger specs
├── test/                   # Integration and E2E tests
├── .env.example            # Environment variables template
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Docker (optional, for local development)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your .env file with proper values
```

### Environment Variables

See `.env.example` for all required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sda_app

# JWT
JWT_SECRET=your-secret-key

# Storage
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Streaming
STREAMING_PROVIDER=mux
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret

# AI
OPENAI_API_KEY=your-openai-key
EMBEDDING_MODEL=text-embedding-3-large
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start

# With Docker
docker-compose up
```

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

### Base URL
- Development: `http://localhost:3000/v1`
- Staging: `https://api-staging.example.com/v1`
- Production: `https://api.example.com/v1`

### OpenAPI/Swagger
Visit `/api/docs` for interactive API documentation

### Key Endpoints

#### Public (No Auth)

**Home**
```
GET /v1/home
```
Returns featured sermons, today's devotional, and current quarterlies.

**Sermons**
```
GET /v1/sermons?search=&tag=&series=&speaker=&page=
GET /v1/sermons/{id}
```

**Devotionals**
```
GET /v1/devotionals/today?tz=America/New_York
GET /v1/devotionals?date=2025-11-18&page=1
```

**Quarterlies**
```
GET /v1/quarterlies?kind=adult&lang=en
GET /v1/quarterlies/{id}/lessons
GET /v1/lessons/{id}
GET /v1/lessons/{id}/days/{dayIndex}
```

**Search**
```
GET /v1/search?q=grace
```

**Media**
```
GET /v1/media/{assetId}
```
Returns redirect or signed URL.

**Study Chat**
```
POST /v1/chat/query
{
  "mode": "quarterly|bible",
  "lang": "en",
  "contextRef": "lesson_day:123",
  "query": "How does the memory verse connect to the lesson?",
  "topK": 6
}
```

#### Admin (JWT Required)

**Authentication**
```
POST /v1/admin/login
POST /v1/admin/refresh
```

**Content Management**
```
GET    /v1/admin/sermons
POST   /v1/admin/sermons
PUT    /v1/admin/sermons/{id}
DELETE /v1/admin/sermons/{id}

# Similar for devotionals, quarterlies, lessons, etc.
```

**Media**
```
POST /v1/admin/media/upload
POST /v1/admin/media/youtube-import
```

**Publishing**
```
POST /v1/admin/publish/{contentType}/{id}
POST /v1/admin/schedule/{contentType}/{id}
```

## Database Schema

### Core Tables

- `tag` - Content tags
- `media_asset` - Media library (video, audio, images)
- `speaker` - Sermon speakers
- `series` - Sermon series
- `sermon` - Sermon content
- `sermon_tag` - Many-to-many relationship
- `devotional` - Daily devotionals
- `quarterly` - Sabbath School quarterlies
- `lesson` - Quarterly lessons
- `lesson_day` - Individual lesson days
- `rag_document` - RAG corpus with embeddings

See `migrations/` for complete schema definitions.

## RAG Pipeline

### Architecture

1. **Ingestion**: Content → Chunks → Embeddings → Storage
2. **Retrieval**: Query → Embedding → Vector Search + BM25 → Rerank
3. **Generation**: Retrieved Contexts + Query → LLM → Answer with Citations

### Components

- **Embedding Generator**: Uses OpenAI text-embedding-3-large
- **Document Chunker**: 500-1000 token chunks with overlap
- **Retrieval Agent**: Hybrid vector + keyword search
- **LLM Orchestrator**: Prompt construction and response generation
- **Citation Extractor**: Extract and format source citations

### Modes

**Quarterly Mode**
- Scoped to specific lesson/day context
- Includes Bible references from lesson
- Strict citation requirements

**Bible Q&A Mode**
- Public-domain Bible text only
- Study notes from approved sources
- Verse-level citations

## Development

### Code Style

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

### Debugging

Use VS Code debugger or:
```bash
npm run dev:debug
```

### Database Migrations

```bash
# Create migration
npm run migrate:create migration-name

# Run migrations
npm run migrate

# Rollback
npm run migrate:rollback
```

## Deployment

### Environment Setup

1. Provision PostgreSQL with pgvector
2. Set up Supabase or S3 for storage
3. Configure Mux or Cloudflare Stream
4. Set all environment variables
5. Run migrations

### Build

```bash
npm run build
```

### Deploy

Using Docker:
```bash
docker build -t sda-backend .
docker push your-registry/sda-backend:latest
```

Using Supabase Edge Functions:
```bash
supabase functions deploy
```

## Monitoring

### Health Check
```
GET /health
```

### Metrics
- Request latency (P50, P95, P99)
- Error rate
- Database query performance
- RAG pipeline performance
- Media delivery metrics

### Logging
Structured JSON logs with request IDs for tracing.

## Security

- JWT authentication for admin endpoints
- Row-Level Security (RLS) in database
- Rate limiting on all endpoints
- Input validation and sanitization
- Secure media URLs (presigned/time-limited)
- CORS configuration
- SQL injection prevention
- XSS protection

## Performance

### Optimization Strategies
- Database query optimization with proper indexes
- Response caching (Redis optional)
- CDN for media delivery
- Connection pooling
- Async processing for heavy operations
- Rate limiting to prevent abuse

### Targets
- API latency: <300ms (P95)
- Search latency: <300ms (P95)
- RAG query: <3s (P95)
- Video startup: <1s

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify network connectivity

**Migration Failures**
- Check for schema conflicts
- Review migration logs
- Ensure pgvector extension is installed

**RAG Not Working**
- Verify OPENAI_API_KEY is set
- Check embeddings are generated
- Ensure pgvector index exists

**Media Upload Issues**
- Check storage credentials
- Verify bucket permissions
- Check file size limits

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update OpenAPI spec for API changes
4. Document complex logic
5. Use conventional commits

## License

[To be determined]

---

**Maintainer**: Backend Team
**Last Updated**: 2025-11-18
