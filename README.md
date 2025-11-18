# SDA Content App

> Android-first MVP for sermons, devotionals, Sabbath School quarterlies, and AI-powered study chat

## Project Overview

The SDA Content App is a comprehensive platform designed to deliver spiritual content including:
- **Sermons**: Video/audio streaming with HLS support
- **Devotionals**: Daily readings with optional audio
- **Quarterlies**: Adult, Youth, and Kids Sabbath School lessons with offline support
- **Study Chat**: AI-powered assistant for Bible and quarterly study (optional)

## Repository Structure

```
/mobile-android/          # Android app (Kotlin + Jetpack Compose)
  ├── app/                # Main application module
  ├── core/               # Core utilities and shared code
  ├── feature-sermons/    # Sermon browsing and playback
  ├── feature-devotionals/# Daily devotionals
  ├── feature-quarterlies/# Sabbath School quarterlies
  └── feature-chat/       # AI study chat (RAG)

/backend/                 # Backend API (TypeScript/Node.js)
  ├── migrations/         # Database migrations
  ├── src/                # Source code
  └── openapi/            # API specifications

/admin/                   # Admin panel (Next.js)
  ├── pages/              # Next.js pages
  ├── components/         # React components
  └── lib/                # Utilities and services

/infrastructure/          # Infrastructure as code
  └── terraform/          # Terraform configurations
```

## Documentation

- **[sda_app_spec.md](./sda_app_spec.md)**: Complete technical specification
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**: Detailed implementation roadmap
- **[AGENTS.md](./AGENTS.md)**: Agent architecture and system components

## Quick Start

### Prerequisites

- **Mobile**: Android Studio, JDK 17+
- **Backend**: Node.js 20+, PostgreSQL 15+
- **Admin**: Node.js 20+
- **Infrastructure**: Docker, Terraform (optional)

### Local Development

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run migrate
npm run dev
```

#### Android
```bash
cd mobile-android
# Open in Android Studio or use Gradle directly
./gradlew build
```

#### Admin Panel
```bash
cd admin
npm install
cp .env.local.example .env.local
# Configure your .env.local file
npm run dev
```

## Architecture

### Mobile (Android)
- **Language**: Kotlin
- **UI**: Jetpack Compose, Material3
- **Media**: Media3/ExoPlayer
- **Networking**: Retrofit, OkHttp
- **Local**: Room, DataStore
- **DI**: Hilt

### Backend
- **Runtime**: Node.js/TypeScript or Supabase Edge Functions
- **Database**: PostgreSQL with pgvector
- **Storage**: Supabase Storage or S3
- **Streaming**: Mux or Cloudflare Stream
- **Search**: PostgreSQL FTS

### Admin Panel
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js

## Key Features

### MVP Scope
- ✅ Home screen with featured sermons
- ✅ Sermon browsing and streaming (video/audio)
- ✅ Daily devotionals with archive
- ✅ Sabbath School quarterlies (Adult/Youth/Kids)
- ✅ Offline lesson packs
- ✅ Full-text search
- ✅ Push notifications
- ✅ AI study chat (optional toggle)
- ✅ Admin panel for content management

### Post-MVP
- iOS app
- User profiles and authentication
- Social features
- Playlists and favorites sync
- Donations integration
- Multilingual support
- Live streaming

## Development Phases

- **Phase 0**: Foundations (repos, CI, infrastructure) - Week 1
- **Phase 1**: Backend skeleton - Week 2
- **Phase 2**: Android scaffolding - Week 3
- **Phase 3**: Devotionals - Week 4
- **Phase 4**: Quarterlies - Week 5-6
- **Phase 5**: Admin panel - Week 7-8
- **Phase 6**: Study chat (RAG) - Week 9-10
- **Phase 7**: Polish & release - Week 11-12

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Submit a pull request

### Commit Convention
We use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `test:` Test additions/changes
- `refactor:` Code refactoring

## Testing

### Backend
```bash
npm run test
npm run test:integration
npm run test:e2e
```

### Android
```bash
./gradlew test
./gradlew connectedAndroidTest
```

### Admin
```bash
npm run test
npm run test:e2e
```

## Deployment

### Environments
- **Development**: Auto-deploy on push to `develop`
- **Staging**: Auto-deploy on push to `staging`
- **Production**: Manual deploy from `main`

### CI/CD
GitHub Actions workflows handle:
- Code linting and formatting
- Unit and integration tests
- Build and deployment
- Security scanning

## Security

- Admin authentication with JWT and 2FA
- Row-Level Security (RLS) in database
- Secure media delivery with signed URLs
- No end-user authentication (MVP)
- Anonymous analytics only

## License

[To be determined]

## Support

For issues and questions:
- GitHub Issues: [github.com/yourorg/ska/issues]
- Documentation: [docs link]

## Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed roadmap.

---

**Status**: In Development
**Version**: MVP (v0.1.0)
**Last Updated**: 2025-11-18
