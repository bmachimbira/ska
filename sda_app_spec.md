# SDA Content App — MVP Specification & Implementation Plan

> Android-first MVP for sermons, devotionals, Sabbath School quarterlies, and an optional AI-powered study chat. This document is engineered for execution: concrete scope, architecture, schema, endpoints, and a phased plan with acceptance criteria.

---

## Table of Contents
1. [Product Scope (MVP)](#product-scope-mvp)
2. [Architecture](#architecture)
3. [Data Model (Postgres)](#data-model-postgres)
4. [API Surface (REST v1)](#api-surface-rest-v1)
5. [Android App Spec](#android-app-spec)
6. [Admin Panel Spec](#admin-panel-spec)
7. [AI Study Chat (RAG) Details](#ai-study-chat-rag-details)
8. [Security, Licensing, Compliance](#security-licensing-compliance)
9. [Observability & Analytics](#observability--analytics)
10. [Acceptance Criteria (MVP)](#acceptance-criteria-mvp)
11. [Implementation Plan (Phases)](#implementation-plan-phases)
12. [Risks & Mitigations](#risks--mitigations)
13. [Cost Posture](#cost-posture)
14. [Starter Snippets](#starter-snippets)
15. [Testing Strategy](#testing-strategy)
16. [Decisions to Move Fast](#decisions-to-move-fast)
17. [Environments & CI](#environments--ci)
18. [Repo Structure](#repo-structure)
19. [Feature Flags](#feature-flags)
20. [Appendix: Sample .env](#appendix-sample-env)

---

## Product Scope (MVP)

### Core Features
- **Home**: Hero carousel with featured sermons; tap → stream (video/audio).
- **Sermons**: Browse by series, speaker, tags; video/audio playback; optional offline audio.
- **Devotionals**: Daily reading (text + optional audio), “Today” card, archive.
- **Quarterlies**: Adult / Youth / Kids → Quarter → Lessons → Days; offline lesson packs.
- **Study Chat (optional toggle)**:
  - *Quarterly Assistant*: answers only from the selected lesson’s materials + Bible references.
  - *Bible Q&A*: answers within a public-domain Bible and curated notes.
- **Search** across sermons, devotionals, lessons.
- **Push notifications** for new content and live streams.
- **No end-user auth** for consumption (MVP). Admin-only auth.

### Explicit Non-Goals (Post-MVP)
- iOS app, user profiles, donations/payments, social features, playlists, cloud sync.

---

## Architecture

```mermaid
graph LR
  A[Android App (Compose)] -- REST+CDN --> B[(API / Edge)]
  B -- SQL/RLS --> C[(Postgres + pgvector)]
  B -- Storage --> D[(Object Storage/CDN)]
  B -- Webhooks --> E[Streaming Provider (Mux/CF Stream)]
  F[Admin Panel (Next.js)] -- Admin JWT --> B
  A -- FCM --> G[Push Service]
```

### Mobile (Android)
- **Language/Framework**: Kotlin, Jetpack Compose, Material3, Navigation-Compose.
- **Media**: Media3/ExoPlayer (HLS/DASH), PiP, background audio with MediaSession.
- **Networking**: Retrofit/OkHttp (ETag/If-Modified-Since caching).
- **Local**: Room (cache + downloads), DataStore (prefs), WorkManager (refresh/download).
- **DI/Reactive**: Hilt, Coroutines/Flow.
- **Imagery**: Coil.
- **Push**: Firebase Cloud Messaging (topic-based).

### Backend
- **Fast-path**: Supabase (Postgres + Storage + Auth + pgvector) + lightweight Node/TS edge functions for webhooks/LLM calls.
- **Alt**: NestJS or FastAPI + Postgres + S3 + CloudFront/Cloudflare + Mux/CF Stream.
- **Media**: Mux or Cloudflare Stream for ingest/transcode/delivery (HLS).
- **Search**: Postgres FTS + trigram; upgrade path to Meilisearch/Typesense.

### Admin Panel
- **Stack**: Next.js + TypeScript + Tailwind/MUI.
- **Auth**: Email/password + 2FA; roles (`super_admin`, `editor`, `uploader`, `reader`).
- **Features**: CRUD content, upload/attach media, schedule publish, feature carousel, markdown editor with preview, YouTube import → transcode, lesson pack builder, audit log.

### AI Study Chat (RAG)
- **Corpus**: Quarterly days, devotionals, sermon transcripts (optional), **public-domain Bible** (e.g., KJV/WEB).
- **Store**: Single `rag_document` table + `pgvector` embeddings.
- **Retrieval**: Hybrid vector (cosine) + BM25; strict scoping by context (lesson/day) where applicable.
- **LLM**: Hosted API or self-host later (vLLM). Always return citations; decline outside scope.

---

## Data Model (Postgres)

> Minimal core tables. Add columns/indices as usage data dictates.

```sql
-- Tags
create table tag (
  id bigserial primary key,
  slug text unique not null,
  name text not null
);

-- Media library
create table media_asset (
  id uuid primary key default gen_random_uuid(),
  kind text check (kind in ('video','audio','image','doc')),
  hls_url text,
  dash_url text,
  download_url text,
  width int, height int, duration_seconds int,
  mime text, size_bytes bigint,
  cdn_public bool default true,
  created_at timestamptz default now()
);

-- Sermons
create table speaker (
  id bigserial primary key,
  name text not null,
  bio text
);

create table series (
  id bigserial primary key,
  title text not null,
  description text,
  hero_image uuid references media_asset(id)
);

create table sermon (
  id bigserial primary key,
  title text not null,
  description text,
  scripture_refs text[],
  speaker_id bigint references speaker(id),
  series_id bigint references series(id),
  video_asset uuid references media_asset(id),
  audio_asset uuid references media_asset(id),
  thumbnail_asset uuid references media_asset(id),
  published_at timestamptz,
  is_featured bool default false
);

create table sermon_tag (
  sermon_id bigint references sermon(id) on delete cascade,
  tag_id bigint references tag(id) on delete cascade,
  primary key (sermon_id, tag_id)
);

-- Devotionals (daily)
create table devotional (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  author text,
  body_md text not null,
  audio_asset uuid references media_asset(id),
  date date not null,
  lang text default 'en'
);

-- Quarterlies
create table quarterly (
  id bigserial primary key,
  kind text check (kind in ('adult','youth','kids')) not null,
  year int not null,
  quarter int check (quarter between 1 and 4) not null,
  title text not null,
  lang text default 'en',
  hero_image uuid references media_asset(id),
  unique(kind, year, quarter, lang)
);

create table lesson (
  id bigserial primary key,
  quarterly_id bigint references quarterly(id) on delete cascade,
  index_in_quarter int not null,
  title text not null
);

create table lesson_day (
  id bigserial primary key,
  lesson_id bigint references lesson(id) on delete cascade,
  day_index int check (day_index between 1 and 7) not null,
  date date,
  title text not null,
  body_md text not null,
  memory_verse text,
  audio_asset uuid references media_asset(id)
);

-- RAG
create extension if not exists vector;
create table rag_document (
  id bigserial primary key,
  source_kind text check (source_kind in ('quarterly_day','devotional','sermon_transcript','bible')),
  source_ref text not null,   -- e.g., 'lesson_day:123' or 'bible:John.3.16'
  lang text default 'en',
  title text,
  body_plain text not null,
  embedding vector(1536)
);
create index on rag_document using ivfflat (embedding vector_cosine_ops);
```

---

## API Surface (REST v1)

Base: `/v1`

**Public (no end-user auth)**
- `GET /home` → featured sermons, today’s devotional, current quarterlies.
- `GET /sermons?search=&tag=&series=&speaker=&page=`
- `GET /sermons/{id}`
- `GET /devotionals/today?tz=`
- `GET /devotionals?date=&page=`
- `GET /quarterlies?kind=adult|youth|kids&lang=`
- `GET /quarterlies/{id}/lessons`
- `GET /lessons/{id}` → includes days summary + offline ZIP URL
- `GET /lessons/{id}/days/{dayIndex}`
- `GET /search?q=`
- `GET /media/{assetId}` → redirect/signed URL

**Study Chat**
- `POST /chat/query`
```json
{
  "mode": "quarterly|bible",
  "lang": "en",
  "contextRef": "lesson_day:123",
  "query": "How does the memory verse connect to the lesson?",
  "topK": 6
}
```
→ `{ "answer": "...", "citations": [{ "sourceRef": "...", "snippet": "..." }], "safety": {...} }`

**Admin (JWT)**
- CRUD for sermons/series/speakers/media, devotionals, quarterlies/lessons/days.
- `POST /ingest/youtube` → transcode via Mux/CF Stream.
- `POST /publish/quarterly_pack` → bundle lesson ZIP for offline.
- Audit log endpoints.

---

## Android App Spec

**minSdk**: 26+

**Navigation**
- Home → SermonDetail → Player
- Devotionals (Today + list) → DevotionalDetail
- Quarterlies (Adult/Youth/Kids tabs) → Quarterly → Lesson → Day
- StudyChat (context-aware)

**Key Components**
- `HomeViewModel` (featured, today, quarterlies)
- `SermonPlayer` (Media3/ExoPlayer, HLS, PiP, background audio)
- `DownloadsManager` (WorkManager)
- `CachePolicy` (ETag/IMS + Room coherence)
- `RemoteConfig` (feature flags, e.g., enableChat)

**Offline**
- Per-lesson ZIP (markdown/images/audio) saved to app storage.
- Per-sermon audio MP3.
- Prefetch last 7 days devotionals.

**Accessibility**
- Dynamic type, TalkBack labels, captions/subtitles toggle.

---

## Admin Panel Spec

- Data grids for sermons, series, speakers, devotionals, quarterlies, lessons/days, media.
- Markdown editor with live preview; paste-to-upload.
- Schedule publish and feature toggles.
- YouTube import → webhook → transcode → attach to sermon.
- Roles & permissions; audit log.

---

## AI Study Chat (RAG) Details

**Ingestion**
- Normalize Quarterly/Day content to markdown; convert to plain text for embeddings.
- Chunk 500–1,000 tokens with overlap; store in `rag_document` + embeddings.
- Include verse references and internal anchors.

**Retrieval**
- Hybrid (vector + BM25), rerank, scope to context (`contextRef`) for Quarterly mode.
- Return topK contexts with metadata for citations.

**Generation**
- System prompt enforces: reply only from provided contexts or say “not in materials”.
- Include in-text citations with `[^n]` footnotes linking to lesson/day or verse.
- Refuse sensitive topics; keep doctrinal perspective to curated corpus.

**Privacy**
- No PII; anonymous session ID; no cross-user memory.

---

## Security, Licensing, Compliance

- **Rights**: Ensure permissions for Quarterlies/any non–public domain text. Ship a public-domain Bible (KJV/WEB) for offline.
- **Kids**: No accounts; only aggregate analytics; comply with COPPA-like constraints by avoiding targeted tracking.
- **Auth**: Admin JWT (short TTL), refresh rotation, device/IP allowlist optional.
- **RLS**: Row-Level Security for admin tables (Supabase).
- **Secrets**: Managed secrets (Vercel/Cloud Run/Secrets Manager); never in repo.

---

## Observability & Analytics

- **Crash**: Firebase Crashlytics or Sentry.
- **Metrics**: API latency, video startup time, rebuffer rate, completion rate.
- **Events**: `video_play`, `video_complete`, `audio_download`, `devotional_open`, `lesson_day_open`, `chat_query`, `search_performed`.
- Structured logs with request IDs; P95/P99 dashboards.

---

## Acceptance Criteria (MVP)

- **Home**: Carousel shows ≥5 featured sermons; tap → player screen in ≤1s (cached hero images).
- **Playback**: HLS ABR on Wi‑Fi/cellular; PiP; audio continues with screen off; captions toggle.
- **Devotionals**: Today auto-resolves by device timezone; last 7 days cached offline.
- **Quarterlies**: Navigate Adult/Youth/Kids → Quarter → Lesson → Day; day markdown renders correctly; offline pack works.
- **Search**: Relevant cross-entity results; server processing <300 ms for typical queries.
- **Chat (if enabled)**: Answers cite ≥3 sources for non-trivial Qs; declines gracefully when OOS.
- **Admin**: Editor uploads video, creates sermon, marks featured, sees it on Home after publish.
- **Stability**: Crash-free sessions ≥99.5% during pilot.

---

## Implementation Plan (Phases)

- [ ] **Phase 0 — Foundations**: Repos (mobile/backend/admin), CI (GH Actions), secrets, infra provisioning (Supabase + Storage + Mux/CF).
- [ ] **Phase 1 — Backend Skeleton**: Schema migrations, seed, `/v1/home` & read endpoints, FTS search, media ingest webhook.
- [ ] **Phase 2 — Android Scaffolding**: Compose shell, NavHost, retrofit client, Room cache, Home/Sermons/Player.
- [ ] **Phase 3 — Devotionals**: Today card, list/detail, offline prefetch.
- [ ] **Phase 4 — Quarterlies**: Quarter → lesson → day flows, markdown rendering, offline ZIPs.
- [ ] **Phase 5 — Admin Panel**: Auth/roles, CRUD, media upload, feature flags, YouTube import.
- [ ] **Phase 6 — Study Chat (Optional)**: Embedding pipeline, `/chat/query`, Android chat UI with streaming + citation chips.
- [ ] **Phase 7 — Polish & Release**: FCM topics, deep links, accessibility, analytics, crash reporting, internal testing track.

---

## Risks & Mitigations

- **Licensing for Quarterlies** → Secure permissions; if unavailable, ship church-authored summaries first.
- **LLM hallucinations** → Retrieval-only prompt, strict context, required citations, refusal policy.
- **Streaming cost/ops** → Start with YouTube import if necessary; migrate to Mux/CF when scale requires.
- **Kids’ data** → No accounts; minimal analytics; parental-safe defaults.
- **Offline pack size** → Optimize images, delta updates, lazy-load.

---

## Cost Posture

- Lean infra: Supabase/Vercel + Mux/CF + FCM.
- Avoid long-running per-user services; offload video to CDN; reserve AI for chat only and consider caching/response reuse for common questions.

---

## Starter Snippets

**OpenAPI (excerpt)**
```yaml
openapi: 3.0.3
info: { title: SDA App API, version: 1.0.0 }
paths:
  /v1/home:
    get: { responses: { '200': { description: OK } } }
  /v1/sermons:
    get:
      parameters:
        - { name: search, in: query, schema: { type: string } }
        - { name: page, in: query, schema: { type: integer, minimum: 1 } }
      responses: { '200': { description: OK } }
  /v1/chat/query:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                mode: { type: string, enum: [quarterly, bible] }
                contextRef: { type: string }
                query: { type: string }
                topK: { type: integer }
      responses: { '200': { description: OK } }
```

**Android: Media3 player (HLS) in Compose**
```kotlin
@Composable
fun SermonPlayerScreen(hlsUrl: String, onBack: () -> Unit) {
    val context = LocalContext.current
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri(hlsUrl)
            setMediaItem(mediaItem)
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(Unit) { onDispose { exoPlayer.release() } }
    Scaffold(topBar = {
        TopAppBar(title = { Text("Now Playing") },
            navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null) } })
    }) { padding ->
        AndroidView(
            modifier = Modifier.padding(padding).fillMaxSize(),
            factory = {
                PlayerView(it).apply { player = exoPlayer; useController = true }
            }
        )
    }
}
```

**Retrofit service**
```kotlin
interface ApiService {
    @GET("v1/home") suspend fun getHome(): HomeResponse
    @GET("v1/sermons") suspend fun getSermons(@Query("search") q: String? = null): SermonList
    @GET("v1/devotionals/today") suspend fun getToday(@Query("tz") tz: String): Devotional
    @GET("v1/quarterlies") suspend fun getQuarterlies(@Query("kind") kind: String, @Query("lang") lang: String = "en"): List<Quarterly>
    @POST("v1/chat/query") suspend fun chat(@Body req: ChatRequest): ChatResponse
}
```

**RAG query (server pseudo-TS)**
```ts
const queryRag = async (q: string, scope: Scope) => {
  const embedding = await embed(q);
  const { rows } = await sql/*sql*/`
    select id, source_ref, title, body_plain,
           1 - (embedding <#> ${embedding}) as score
    from rag_document
    where ${scope.whereSql}
    order by embedding <#> ${embedding}
    limit 12`;
  const contexts = rerankBM25(q, rows).slice(0, 6);
  const prompt = buildPrompt(q, contexts);
  const answer = await llm(prompt);
  return withCitations(answer, contexts);
};
```

---

## Testing Strategy

- **Unit**: ViewModels, repositories, formatters.
- **Instrumentation**: Compose UI nav flows, markdown rendering, downloads.
- **Playback**: Headless Media3 tests with mock HLS.
- **Contract**: OpenAPI schema validation (Dredd/Prism) in CI.
- **Load**: k6 for `/v1/home`, `/v1/search`, `/v1/chat/query`.
- **Security**: JWT tests, SQLi tests, storage ACL checks.
- **Admin**: Playwright for CRUD/media upload flows.

---

## Decisions to Move Fast

- Supabase + pgvector for content + RAG store.
- Mux (or Cloudflare Stream) for video HLS and captions.
- Next.js Admin with role-based access and markdown editor.
- Android Compose with Media3; offline lesson packs.
- Public-domain Bible bundled; quarterly content only with permissions.
- Study Chat behind a remote feature flag.

---

## Environments & CI

**Envs**: dev, staging, prod (separate DBs & storage buckets).  
**CI/CD**:
- Mobile: build, unit tests, lint (ktlint/detekt), upload to internal track.
- Backend: migrations (safe), unit/integration tests, deploy (zero-downtime).
- Admin: typecheck, lint, e2e smoke (Playwright), deploy.

---

## Repo Structure

```
/mobile-android/
  app/
  core/
  feature-sermons/
  feature-devotionals/
  feature-quarterlies/
  feature-chat/
  build.gradle.kts
/backend/
  migrations/
  src/
  openapi/
  package.json
/admin/
  pages/
  components/
  lib/
  package.json
/infrastructure/
  terraform/
```

---

## Feature Flags

- `enableChat`
- `enableDownloads`
- `enableKids`
- `enableYouTubeImport`
- Remote-configurable from Admin.

---

## Appendix: Sample .env

```
# Backend
DATABASE_URL=postgres://...
JWT_SECRET=...
STORAGE_BUCKET_PUBLIC=public
STORAGE_BUCKET_PRIVATE=private
STREAMING_PROVIDER=mux
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
OPENAI_API_KEY=... # or ANTHROPIC_API_KEY
EMBEDDING_MODEL=text-embedding-3-large

# Admin
NEXTAUTH_SECRET=...
NEXT_PUBLIC_API_BASE=https://api.example.com

# Mobile (gradle.properties or remote config)
API_BASE_URL=https://api.example.com/v1
FEATURE_ENABLE_CHAT=false
```

---

**Status**: Draft v1.0 — Ready for implementation.
