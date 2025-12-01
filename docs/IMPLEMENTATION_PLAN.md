# SDA Content App - Implementation Plan

> Detailed implementation roadmap for Android-first MVP with sermons, devotionals, quarterlies, and AI study chat

## Overview

This plan transforms the SDA App specification into actionable development phases with concrete deliverables, timelines, and success criteria. The implementation follows a phased approach prioritizing core features and user value.

---

## Timeline Summary

- **Phase 0**: Foundations (Week 1)
- **Phase 1**: Backend Skeleton (Week 2)
- **Phase 2**: Android Scaffolding (Week 3)
- **Phase 3**: Devotionals (Week 4)
- **Phase 4**: Quarterlies (Week 5-6)
- **Phase 5**: Admin Panel (Week 7-8)
- **Phase 6**: Study Chat (Week 9-10)
- **Phase 7**: Polish & Release (Week 11-12)

**Total**: ~12 weeks to MVP

---

## Phase 0: Foundations (Week 1)

### Objectives
- Repository structure and organization
- CI/CD pipelines
- Infrastructure provisioning
- Development environment setup

### Tasks

#### 0.1 Repository Setup
- [ ] Create monorepo structure with `/mobile-android`, `/backend`, `/admin`, `/infrastructure`
- [ ] Initialize Git with `.gitignore` for each stack
- [ ] Set up branch protection rules
- [ ] Create README.md files for each module
- [ ] Set up conventional commits and PR templates

#### 0.2 Infrastructure Provisioning
- [ ] Provision Supabase project (dev/staging/prod)
- [ ] Set up PostgreSQL with pgvector extension
- [ ] Configure object storage buckets (public/private)
- [ ] Set up Mux or Cloudflare Stream account
- [ ] Configure FCM for push notifications
- [ ] Set up monitoring/observability (Sentry, Datadog, or equivalent)

#### 0.3 CI/CD Pipelines
- [ ] GitHub Actions workflow for backend (lint, test, deploy)
- [ ] GitHub Actions workflow for Android (build, lint, test)
- [ ] GitHub Actions workflow for admin panel (typecheck, lint, deploy)
- [ ] Set up secrets management in CI
- [ ] Configure auto-deployment to dev environment
- [ ] Set up staging deployment with manual approval

#### 0.4 Development Environment
- [ ] Document local setup instructions
- [ ] Create Docker Compose for local backend development
- [ ] Set up environment variable templates (`.env.example`)
- [ ] Configure linters and formatters (ktlint, ESLint, Prettier)
- [ ] Set up pre-commit hooks

### Success Criteria
- ✓ All developers can clone and run the project locally
- ✓ CI pipelines run on every PR
- ✓ Infrastructure environments are accessible
- ✓ Documentation is clear and complete

---

## Phase 1: Backend Skeleton (Week 2)

### Objectives
- Database schema and migrations
- Core API endpoints
- Media asset management
- Full-text search

### Tasks

#### 1.1 Database Schema
- [ ] Create migration scripts for all tables (tag, media_asset, speaker, series, sermon, devotional, quarterly, lesson, lesson_day, rag_document)
- [ ] Add indexes for common queries
- [ ] Set up Row-Level Security policies
- [ ] Create seed data script with sample content
- [ ] Test migrations on dev/staging

#### 1.2 API Foundation
- [ ] Set up NestJS or Supabase Edge Functions
- [ ] Implement OpenAPI/Swagger documentation
- [ ] Create base DTOs and validation schemas
- [ ] Set up error handling and logging middleware
- [ ] Implement rate limiting

#### 1.3 Core Endpoints (Read-only)
- [ ] `GET /v1/home` - Featured content endpoint
- [ ] `GET /v1/sermons` - List sermons with filtering
- [ ] `GET /v1/sermons/{id}` - Sermon detail
- [ ] `GET /v1/devotionals/today` - Today's devotional
- [ ] `GET /v1/devotionals` - Devotional archive
- [ ] `GET /v1/quarterlies` - List quarterlies
- [ ] `GET /v1/quarterlies/{id}/lessons` - Lessons in quarterly
- [ ] `GET /v1/lessons/{id}` - Lesson with days
- [ ] `GET /v1/lessons/{id}/days/{dayIndex}` - Day detail

#### 1.4 Search Implementation
- [ ] Implement PostgreSQL full-text search
- [ ] Create `GET /v1/search` endpoint
- [ ] Add trigram similarity for fuzzy matching
- [ ] Optimize search queries with proper indexing
- [ ] Test search performance (target <300ms)

#### 1.5 Media Management
- [ ] Implement media upload to object storage
- [ ] Create signed URL generation for private media
- [ ] Set up CDN integration
- [ ] Create webhook for Mux/CF Stream ingest
- [ ] Implement `GET /v1/media/{assetId}` endpoint

### Success Criteria
- ✓ All read endpoints return correct data
- ✓ OpenAPI docs are complete and accurate
- ✓ Search returns relevant results in <300ms
- ✓ Media uploads work end-to-end
- ✓ Database can handle expected load (load testing)

---

## Phase 2: Android Scaffolding (Week 3)

### Objectives
- Android app shell with navigation
- Network layer and caching
- Home screen and sermon playback

### Tasks

#### 2.1 Project Setup
- [ ] Create Android project with Compose and Material3
- [ ] Set up Hilt for dependency injection
- [ ] Configure Retrofit and OkHttp
- [ ] Set up Room database for caching
- [ ] Configure DataStore for preferences
- [ ] Add Coil for image loading

#### 2.2 Architecture & Navigation
- [ ] Implement MVVM/MVI architecture
- [ ] Set up Navigation Compose
- [ ] Create bottom navigation (Home, Sermons, Devotionals, Quarterlies)
- [ ] Implement deep linking structure
- [ ] Create common UI components and theme

#### 2.3 Network & Caching Layer
- [ ] Create API service interfaces with Retrofit
- [ ] Implement repository pattern
- [ ] Add ETag/If-Modified-Since caching
- [ ] Set up Room entities and DAOs
- [ ] Implement cache-first strategy with stale-while-revalidate
- [ ] Add offline detection and error handling

#### 2.4 Home Screen
- [ ] Create HomeViewModel
- [ ] Implement featured sermon carousel
- [ ] Add "Today's Devotional" card
- [ ] Show current quarterlies
- [ ] Add pull-to-refresh
- [ ] Implement loading and error states

#### 2.5 Sermon Playback
- [ ] Set up Media3/ExoPlayer
- [ ] Create SermonPlayerScreen with HLS support
- [ ] Implement video controls (play/pause, seek, quality)
- [ ] Add Picture-in-Picture mode
- [ ] Implement background audio with MediaSession
- [ ] Add playback notification with controls
- [ ] Support audio-only playback option

#### 2.6 Sermons List & Detail
- [ ] Create SermonListScreen with filtering
- [ ] Implement search, tag, series, speaker filters
- [ ] Create SermonDetailScreen
- [ ] Add related sermons section
- [ ] Implement offline audio download option

### Success Criteria
- ✓ App builds and runs on Android 8+
- ✓ Navigation flows work smoothly
- ✓ Home screen loads featured content
- ✓ Video playback works with HLS
- ✓ PiP and background audio functional
- ✓ Offline cache works correctly

---

## Phase 3: Devotionals (Week 4)

### Objectives
- Daily devotional reading experience
- Archive browsing
- Offline prefetch

### Tasks

#### 3.1 Backend Enhancements
- [ ] Ensure devotional endpoints handle timezone correctly
- [ ] Add audio asset support for devotionals
- [ ] Implement pagination for archive
- [ ] Add calendar-based navigation endpoint

#### 3.2 Android Implementation
- [ ] Create DevotionalViewModel
- [ ] Build "Today" devotional card (Home & dedicated tab)
- [ ] Implement DevotionalDetailScreen with markdown rendering
- [ ] Add audio playback for devotionals
- [ ] Create archive list with calendar view option
- [ ] Implement date picker for browsing

#### 3.3 Offline Support
- [ ] Implement WorkManager for prefetching last 7 days
- [ ] Cache devotional content and audio
- [ ] Add offline indicator in UI
- [ ] Implement background refresh strategy

#### 3.4 UI/UX Polish
- [ ] Add share functionality
- [ ] Implement adjustable text size
- [ ] Add bookmark/favorite capability (local only)
- [ ] Create smooth transitions and animations

### Success Criteria
- ✓ Today's devotional auto-resolves by timezone
- ✓ Last 7 days cached offline
- ✓ Markdown renders correctly
- ✓ Audio playback integrated smoothly
- ✓ Archive browsing is intuitive

---

## Phase 4: Quarterlies (Week 5-6)

### Objectives
- Quarterly browsing and navigation
- Lesson and day reading
- Offline lesson packs

### Tasks

#### 4.1 Backend Enhancements
- [ ] Implement quarterly pack generation (ZIP)
- [ ] Add offline pack metadata endpoint
- [ ] Create lesson progress tracking (optional)
- [ ] Optimize markdown content delivery

#### 4.2 Quarterly Navigation
- [ ] Create QuarterlyListScreen with tabs (Adult/Youth/Kids)
- [ ] Implement QuarterlyDetailScreen showing all lessons
- [ ] Add LessonScreen showing all 7 days
- [ ] Build LessonDayDetailScreen with markdown rendering

#### 4.3 Content Rendering
- [ ] Implement robust markdown renderer with images
- [ ] Add scripture reference detection and highlighting
- [ ] Implement memory verse display
- [ ] Add audio playback for lesson days
- [ ] Support footnotes and cross-references

#### 4.4 Offline Packs
- [ ] Implement offline pack download with WorkManager
- [ ] Create download progress UI
- [ ] Unzip and cache lesson content locally
- [ ] Add download management screen
- [ ] Implement storage cleanup and management

#### 4.5 Study Experience
- [ ] Add day navigation (previous/next)
- [ ] Implement reading progress indicator
- [ ] Add notes capability (local storage)
- [ ] Create sharing functionality for verses/lessons

### Success Criteria
- ✓ Navigate Adult/Youth/Kids → Quarter → Lesson → Day
- ✓ Markdown renders perfectly
- ✓ Offline packs download and work without network
- ✓ Audio playback integrated
- ✓ Reading experience is smooth and accessible

---

## Phase 5: Admin Panel (Week 7-8)

### Objectives
- Authentication and authorization
- Content management CRUD
- Media upload and management
- Publishing workflow

### Tasks

#### 5.1 Authentication & Authorization
- [ ] Set up NextAuth.js with email/password
- [ ] Implement role-based access control (super_admin, editor, uploader, reader)
- [ ] Add 2FA support (TOTP)
- [ ] Create user management interface
- [ ] Implement audit logging

#### 5.2 Admin Dashboard
- [ ] Create dashboard layout with navigation
- [ ] Build overview/stats page
- [ ] Implement responsive design
- [ ] Add dark mode support

#### 5.3 Content Management
- [ ] Build sermon CRUD interface
- [ ] Create series and speaker management
- [ ] Implement devotional editor with markdown preview
- [ ] Build quarterly/lesson/day management
- [ ] Add tag management system
- [ ] Implement bulk operations

#### 5.4 Media Management
- [ ] Create media library interface
- [ ] Implement drag-and-drop upload
- [ ] Add YouTube import functionality
- [ ] Create media attachment workflow
- [ ] Implement thumbnail generation
- [ ] Add media preview and metadata editing

#### 5.5 Publishing Workflow
- [ ] Implement draft/published status
- [ ] Add scheduled publishing
- [ ] Create feature toggle for carousel
- [ ] Build preview functionality
- [ ] Add version history

#### 5.6 Advanced Features
- [ ] Create lesson pack builder
- [ ] Implement markdown editor with live preview
- [ ] Add paste-to-upload for images
- [ ] Build audit log viewer
- [ ] Create analytics dashboard

### Success Criteria
- ✓ Admin can log in securely with 2FA
- ✓ Complete CRUD for all content types
- ✓ Media upload works (including YouTube)
- ✓ Content can be scheduled and featured
- ✓ Audit trail is complete
- ✓ Interface is intuitive and responsive

---

## Phase 6: Study Chat (RAG) (Week 9-10)

### Objectives
- Embedding generation and storage
- Retrieval system
- LLM integration
- Android chat interface

### Tasks

#### 6.1 RAG Infrastructure
- [ ] Set up embedding model (OpenAI/local)
- [ ] Create document chunking pipeline
- [ ] Implement embedding generation for existing content
- [ ] Set up pgvector indexes
- [ ] Create batch processing for content ingestion

#### 6.2 Content Ingestion
- [ ] Build ingestion pipeline for quarterly days
- [ ] Process devotionals into RAG format
- [ ] Add sermon transcripts (optional)
- [ ] Ingest public-domain Bible (KJV/WEB)
- [ ] Create incremental update mechanism

#### 6.3 Retrieval System
- [ ] Implement hybrid search (vector + BM25)
- [ ] Add reranking logic
- [ ] Create context scoping for quarterly mode
- [ ] Implement topK retrieval with metadata
- [ ] Optimize query performance

#### 6.4 LLM Integration
- [ ] Set up LLM API client (OpenAI/Anthropic)
- [ ] Create system prompts for each mode
- [ ] Implement citation extraction
- [ ] Add safety/refusal logic
- [ ] Create streaming response handler

#### 6.5 Backend API
- [ ] Implement `POST /v1/chat/query` endpoint
- [ ] Add request validation
- [ ] Implement rate limiting
- [ ] Add response caching for common queries
- [ ] Create session management (stateless)

#### 6.6 Android Chat UI
- [ ] Create StudyChatScreen with context selector
- [ ] Implement chat message list with bubbles
- [ ] Add streaming message display
- [ ] Create citation chips with tap-to-view
- [ ] Implement mode toggle (Quarterly/Bible)
- [ ] Add copy/share message functionality
- [ ] Create chat history (session-based)

#### 6.7 Feature Flag Integration
- [ ] Implement remote config for `enableChat`
- [ ] Add feature toggle in admin panel
- [ ] Create graceful degradation when disabled
- [ ] Add A/B testing capability

### Success Criteria
- ✓ RAG pipeline processes all content
- ✓ Retrieval returns relevant contexts
- ✓ Answers cite ≥3 sources for non-trivial questions
- ✓ System declines gracefully for out-of-scope queries
- ✓ Chat UI is responsive and intuitive
- ✓ Citations link correctly to source material
- ✓ Feature can be toggled remotely

---

## Phase 7: Polish & Release (Week 11-12)

### Objectives
- Production readiness
- Testing and QA
- Performance optimization
- Release preparation

### Tasks

#### 7.1 Push Notifications
- [ ] Set up FCM topic-based notifications
- [ ] Implement notification sending from admin
- [ ] Add notification preferences in app
- [ ] Create deep link handling from notifications
- [ ] Test notification delivery

#### 7.2 Deep Linking
- [ ] Implement Android App Links
- [ ] Create URL scheme for all content types
- [ ] Add sharing with deep links
- [ ] Test deep link navigation

#### 7.3 Accessibility
- [ ] Audit app with TalkBack
- [ ] Add content descriptions to all interactive elements
- [ ] Implement dynamic type scaling
- [ ] Add caption/subtitle toggle for videos
- [ ] Test with accessibility scanner
- [ ] Support high contrast mode

#### 7.4 Analytics & Monitoring
- [ ] Implement event tracking (video_play, devotional_open, etc.)
- [ ] Add crash reporting (Crashlytics/Sentry)
- [ ] Create performance monitoring
- [ ] Set up alerting for critical errors
- [ ] Build analytics dashboard

#### 7.5 Performance Optimization
- [ ] Optimize app startup time
- [ ] Reduce APK size
- [ ] Optimize image loading and caching
- [ ] Improve video startup time
- [ ] Reduce network requests
- [ ] Optimize database queries

#### 7.6 Testing
- [ ] Write unit tests for ViewModels and repositories
- [ ] Create UI tests for critical flows
- [ ] Perform load testing on backend
- [ ] Conduct security testing (OWASP)
- [ ] Test offline scenarios thoroughly
- [ ] Perform cross-device testing

#### 7.7 Documentation
- [ ] Create user documentation
- [ ] Write API documentation
- [ ] Document deployment procedures
- [ ] Create troubleshooting guides
- [ ] Write contribution guidelines

#### 7.8 Release Preparation
- [ ] Create release build configuration
- [ ] Set up Play Store listing
- [ ] Prepare screenshots and promotional graphics
- [ ] Create privacy policy and terms of service
- [ ] Set up internal testing track
- [ ] Conduct closed alpha testing
- [ ] Address feedback and bugs
- [ ] Prepare for beta release

### Success Criteria
- ✓ Crash-free sessions ≥99.5%
- ✓ App startup time <2s
- ✓ Video playback starts <1s
- ✓ All accessibility requirements met
- ✓ Analytics capturing all key events
- ✓ App passes security audit
- ✓ Internal testing feedback addressed
- ✓ Ready for beta release

---

## Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Quarterly licensing issues | High | Secure permissions early; fall back to church-authored content |
| LLM hallucinations | Medium | Strict retrieval-only prompts, citations required, refusal policy |
| Streaming costs exceed budget | Medium | Start with YouTube, migrate to Mux/CF when needed |
| Performance issues with offline packs | Medium | Optimize images, implement delta updates, lazy loading |
| pgvector performance at scale | Medium | Monitor query times, consider separate vector DB if needed |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Delayed content availability | High | Build with sample content, parallelize content creation |
| Team availability | Medium | Cross-train team members, document thoroughly |
| Third-party service outages | Medium | Implement circuit breakers, graceful degradation |
| Scope creep | High | Strict MVP definition, phase gates, change control |

---

## Success Metrics

### MVP Launch Metrics
- **Adoption**: 1,000+ installs in first month
- **Engagement**: 40%+ DAU/MAU ratio
- **Stability**: <1% crash rate
- **Performance**:
  - App startup <2s (P95)
  - Video startup <1s (P95)
  - API latency <300ms (P95)
- **Content**:
  - 50+ sermons available
  - Daily devotionals current
  - All quarterly content for current quarter

### Quality Metrics
- Test coverage >70%
- Accessibility score >85%
- Play Store rating >4.5
- Feature adoption (chat if enabled) >20%

---

## Dependencies & Prerequisites

### External Dependencies
- Supabase account and project setup
- Mux or Cloudflare Stream account
- Firebase/FCM setup
- LLM API access (OpenAI/Anthropic)
- Content licensing agreements
- Public-domain Bible text

### Team Requirements
- Android developer (Kotlin/Compose)
- Backend developer (TypeScript/Node or Python)
- Frontend developer (React/Next.js)
- DevOps engineer (part-time)
- Content creator/editor
- QA tester

### Tools & Services
- GitHub for version control
- GitHub Actions for CI/CD
- Figma for design (optional)
- Linear/Jira for project management
- Slack for team communication

---

## Post-MVP Roadmap

### Future Enhancements (Not in MVP)
- iOS app
- User profiles and authentication
- Playlists and favorites sync
- Social features (comments, sharing)
- Donations/payments integration
- Multilingual support expansion
- Offline Bible with advanced study tools
- Custom reading plans
- Community features
- Live streaming capabilities

---

## Conclusion

This implementation plan provides a clear, actionable roadmap to deliver the SDA Content App MVP in 12 weeks. Each phase builds on the previous one, with concrete deliverables and success criteria. The plan balances speed with quality, prioritizing user value while maintaining technical excellence.

**Next Steps**:
1. Review and approve this plan
2. Assemble the team
3. Kick off Phase 0: Foundations
4. Establish weekly sync meetings
5. Begin development

---

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: Ready for review and approval
