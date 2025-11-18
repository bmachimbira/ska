# SDA Content App - Android

> Android application for sermons, devotionals, and Sabbath School quarterlies

## Overview

Native Android app built with Jetpack Compose providing:
- Video/audio sermon streaming with HLS support
- Daily devotionals with offline capability
- Sabbath School quarterlies with offline lesson packs
- AI-powered study chat (optional)
- Full-text search across content
- Push notifications

## Technology Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose, Material3
- **Architecture**: MVVM/MVI with Clean Architecture
- **DI**: Hilt
- **Networking**: Retrofit, OkHttp
- **Media**: Media3/ExoPlayer
- **Database**: Room
- **Preferences**: DataStore
- **Image Loading**: Coil
- **Background Work**: WorkManager
- **Async**: Coroutines, Flow
- **Navigation**: Navigation Compose

## Project Structure

```
mobile-android/
├── app/                        # Main application module
│   ├── src/main/
│   │   ├── java/com/sda/app/
│   │   │   ├── MainActivity.kt
│   │   │   ├── SDAApplication.kt
│   │   │   └── di/            # App-level DI modules
│   │   ├── res/               # Resources
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
│
├── core/                       # Core shared code
│   ├── common/                # Common utilities
│   ├── network/               # Network layer
│   ├── database/              # Room database
│   ├── datastore/             # Preferences
│   └── designsystem/          # Design system components
│
├── feature-sermons/           # Sermon feature module
│   ├── presentation/          # ViewModels, UI
│   ├── domain/                # Use cases
│   └── data/                  # Repositories
│
├── feature-devotionals/       # Devotionals feature
│   ├── presentation/
│   ├── domain/
│   └── data/
│
├── feature-quarterlies/       # Quarterlies feature
│   ├── presentation/
│   ├── domain/
│   └── data/
│
├── feature-chat/              # Study chat feature
│   ├── presentation/
│   ├── domain/
│   └── data/
│
├── build.gradle.kts           # Root build file
├── settings.gradle.kts
└── gradle.properties
```

## Getting Started

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17+
- Android SDK 34
- Minimum SDK: 26 (Android 8.0)

### Setup

1. Clone the repository
2. Open in Android Studio
3. Sync Gradle
4. Create `local.properties`:
   ```properties
   sdk.dir=/path/to/android/sdk
   ```
5. Create `gradle.properties` (if not exists):
   ```properties
   API_BASE_URL=http://10.0.2.2:3000/v1
   FEATURE_ENABLE_CHAT=false
   ```

### Build and Run

```bash
# Build debug APK
./gradlew assembleDebug

# Run on connected device/emulator
./gradlew installDebug

# Run tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Lint
./gradlew lint

# Generate test coverage
./gradlew jacocoTestReport
```

## Architecture

### Layers

**Presentation Layer**
- Composable screens
- ViewModels with UiState
- Navigation logic

**Domain Layer**
- Use cases (business logic)
- Domain models
- Repository interfaces

**Data Layer**
- Repository implementations
- API services
- Local database
- Cache management

### State Management

Using MVI pattern with sealed classes:

```kotlin
data class SermonListUiState(
    val sermons: List<Sermon> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val filters: SermonFilters = SermonFilters()
)

sealed interface SermonListEvent {
    data class FilterBySeries(val seriesId: Long) : SermonListEvent
    data class SearchSermons(val query: String) : SermonListEvent
    object Refresh : SermonListEvent
}
```

### Dependency Injection

Using Hilt with module structure:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit { /* ... */ }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService { /* ... */ }
}
```

## Key Features

### 1. Media Playback

**Video Player**
- HLS/DASH streaming
- Adaptive bitrate
- Picture-in-Picture mode
- Landscape fullscreen
- Playback controls (play/pause/seek)
- Quality selection

**Audio Player**
- Background playback
- MediaSession integration
- Notification controls
- Lock screen controls
- Playback speed control

```kotlin
@Composable
fun SermonPlayerScreen(hlsUrl: String) {
    val exoPlayer = rememberExoPlayer(hlsUrl)

    AndroidView(
        factory = { context ->
            PlayerView(context).apply {
                player = exoPlayer
                useController = true
            }
        }
    )
}
```

### 2. Offline Support

**Download Management**
- Background downloads with WorkManager
- Download progress tracking
- Resume capability
- Storage management
- Offline indicator in UI

**Cached Content**
- Last 7 days devotionals
- Selected sermon audio
- Quarterly lesson packs
- Images with Coil disk cache

### 3. Navigation

```kotlin
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Sermons : Screen("sermons")
    object Devotionals : Screen("devotionals")
    object Quarterlies : Screen("quarterlies")
    data class SermonDetail(val id: Long) : Screen("sermon/{id}")
    data class Player(val mediaUrl: String) : Screen("player")
}
```

### 4. Caching Strategy

**ETag/If-Modified-Since**
```kotlin
@Headers("Cache-Control: max-age=3600")
@GET("sermons/{id}")
suspend fun getSermon(
    @Path("id") id: Long,
    @Header("If-None-Match") etag: String? = null
): Response<Sermon>
```

**Room Cache**
- Cache-first with stale-while-revalidate
- Automatic cache invalidation
- TTL-based expiration

### 5. Push Notifications

```kotlin
class SDAFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        // Handle notification
        // Parse deep link
        // Navigate to content
    }
}
```

## UI Components

### Design System

**Theme**
```kotlin
@Composable
fun SDATheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

**Common Components**
- `SDAButton` - Primary/secondary buttons
- `SDACard` - Content cards
- `SDATopBar` - App bars
- `SDATextField` - Input fields
- `LoadingIndicator` - Loading states
- `ErrorView` - Error states
- `EmptyView` - Empty states

### Screens

**Home Screen**
- Featured sermon carousel
- Today's devotional card
- Current quarterlies
- Quick actions

**Sermon List**
- Grid/List toggle
- Filters (series, speaker, tag)
- Search
- Infinite scroll

**Devotional Detail**
- Markdown rendering
- Audio playback
- Share functionality
- Previous/next navigation

**Quarterly Flow**
- Adult/Youth/Kids tabs
- Quarter selection
- Lesson list
- Day-by-day reading
- Offline download

**Study Chat**
- Context-aware chat
- Streaming responses
- Citation chips
- Mode toggle (Quarterly/Bible)

## Data Flow

```
UI (Composable)
    ↓
ViewModel (State + Events)
    ↓
Use Case (Business Logic)
    ↓
Repository (Data Source Abstraction)
    ↓ ↓
    API (Remote)    Database (Local)
```

## Testing

### Unit Tests

```kotlin
@Test
fun `getSermons returns cached data when offline`() = runTest {
    // Given
    coEvery { networkManager.isOnline() } returns false
    coEvery { database.getSermons() } returns cachedSermons

    // When
    val result = repository.getSermons()

    // Then
    assertEquals(cachedSermons, result)
}
```

### UI Tests

```kotlin
@Test
fun homeScreen_displaysFeatureSermons() {
    composeTestRule.setContent {
        HomeScreen(viewModel = mockViewModel)
    }

    composeTestRule
        .onNodeWithText("Featured Sermons")
        .assertIsDisplayed()
}
```

### Screenshot Tests

Using Paparazzi or Shot for screenshot testing.

## Performance Optimization

### LazyColumn/Grid
```kotlin
LazyColumn {
    items(sermons, key = { it.id }) { sermon ->
        SermonCard(sermon)
    }
}
```

### Image Loading
```kotlin
AsyncImage(
    model = ImageRequest.Builder(context)
        .data(sermon.thumbnailUrl)
        .crossfade(true)
        .build(),
    contentDescription = sermon.title
)
```

### Pagination
```kotlin
@Paging(pageSize = 20)
fun getSermons(): PagingSource<Int, Sermon>
```

## Accessibility

- Content descriptions for all interactive elements
- Semantic labels
- TalkBack support
- Dynamic type scaling
- High contrast support
- Focus management

```kotlin
Button(
    onClick = { /* ... */ },
    modifier = Modifier.semantics {
        contentDescription = "Play sermon"
    }
) {
    Icon(Icons.Default.PlayArrow, contentDescription = null)
}
```

## Security

- HTTPS only
- Certificate pinning (optional)
- ProGuard/R8 obfuscation
- Secure local storage
- No sensitive data in logs

## Build Variants

```kotlin
buildTypes {
    debug {
        applicationIdSuffix = ".debug"
        versionNameSuffix = "-debug"
    }
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}

flavorDimensions += "environment"
productFlavors {
    create("dev") {
        dimension = "environment"
        buildConfigField("String", "API_URL", "\"http://api-dev.example.com\"")
    }
    create("staging") {
        dimension = "environment"
        buildConfigField("String", "API_URL", "\"http://api-staging.example.com\"")
    }
    create("production") {
        dimension = "environment"
        buildConfigField("String", "API_URL", "\"http://api.example.com\"")
    }
}
```

## Deployment

### Internal Testing
```bash
./gradlew bundleRelease
```

Upload to Play Console Internal Testing track.

### Beta Release
Promote from Internal Testing after validation.

### Production Release
Staged rollout (5% → 20% → 50% → 100%)

## Troubleshooting

**Build Issues**
- Clean build: `./gradlew clean`
- Invalidate caches: Android Studio → File → Invalidate Caches

**Playback Issues**
- Check HLS URL format
- Verify network permissions
- Check ExoPlayer logs

**Offline Issues**
- Verify Room database setup
- Check WorkManager status
- Review cache policies

## Contributing

1. Follow Kotlin coding conventions
2. Use ktlint for formatting
3. Write unit tests for ViewModels and repositories
4. Write UI tests for critical flows
5. Update documentation

## License

[To be determined]

---

**Maintainer**: Android Team
**Last Updated**: 2025-11-18
