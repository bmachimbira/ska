# Contributing to SDA Content App

Thank you for your interest in contributing to the SDA Content App! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **For Backend**: Node.js 20+, PostgreSQL 15+
- **For Admin**: Node.js 20+
- **For Android**: Android Studio, JDK 17+, Android SDK 34

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ska.git
   cd ska
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-org/ska.git
   ```

### Set Up Development Environment

Follow the setup instructions in the respective module READMEs:
- [Backend Setup](./backend/README.md)
- [Admin Setup](./admin/README.md)
- [Android Setup](./mobile-android/README.md)

## Development Workflow

### Creating a Branch

1. Ensure your main branch is up to date:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or for bug fixes:
   ```bash
   git checkout -b fix/bug-description
   ```

### Branch Naming Convention

- **Features**: `feature/short-description`
- **Bug Fixes**: `fix/short-description`
- **Documentation**: `docs/short-description`
- **Refactoring**: `refactor/short-description`
- **Tests**: `test/short-description`
- **Chores**: `chore/short-description`

## Coding Standards

### General Principles

- Write clean, readable, and maintainable code
- Follow the Single Responsibility Principle
- Keep functions small and focused
- Write self-documenting code with clear variable and function names
- Add comments only when necessary to explain "why", not "what"

### TypeScript/JavaScript (Backend & Admin)

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier (configs provided)
- Prefer functional programming patterns
- Use async/await over promises

```typescript
// Good
async function getSermon(id: number): Promise<Sermon> {
  const sermon = await db.sermons.findById(id)
  if (!sermon) {
    throw new Error('Sermon not found')
  }
  return sermon
}

// Avoid
function getSermon(id: number) {
  return db.sermons.findById(id).then(sermon => {
    if (!sermon) throw new Error('Sermon not found')
    return sermon
  })
}
```

### Kotlin (Android)

- Follow the [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Use ktlint and detekt (configs provided)
- Prefer immutability (val over var)
- Use Kotlin idioms (extension functions, data classes, etc.)
- Use Coroutines for async operations

```kotlin
// Good
suspend fun getSermon(id: Long): Result<Sermon> = runCatching {
  apiService.getSermon(id)
}

// Avoid
fun getSermon(id: Long, callback: (Sermon?, Error?) -> Unit) {
  // callback-based code
}
```

### Code Formatting

Run formatters before committing:

**Backend/Admin**:
```bash
npm run format
```

**Android**:
```bash
./gradlew ktlintFormat
```

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Scopes

- **backend**: Backend API changes
- **admin**: Admin panel changes
- **android**: Android app changes
- **ci**: CI/CD changes
- **docs**: Documentation changes

### Examples

```bash
feat(android): add sermon offline download

- Implement WorkManager for background downloads
- Add download progress UI
- Support resume capability

Closes #123
```

```bash
fix(backend): correct devotional timezone handling

The devotional API was returning incorrect dates for users in
negative UTC timezones. This fixes the date calculation.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   # Backend
   cd backend && npm test

   # Admin
   cd admin && npm test

   # Android
   cd mobile-android && ./gradlew test
   ```

3. **Run linters**:
   ```bash
   # Backend/Admin
   npm run lint

   # Android
   ./gradlew lint
   ```

4. **Build successfully**:
   ```bash
   # Backend
   npm run build

   # Admin
   npm run build

   # Android
   ./gradlew assembleDebug
   ```

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template completely:
   - **Description**: What does this PR do?
   - **Motivation**: Why is this change needed?
   - **Testing**: How was this tested?
   - **Screenshots**: For UI changes
   - **Checklist**: Complete all items

### PR Requirements

- ✅ All CI checks pass
- ✅ Code is reviewed and approved
- ✅ Tests are added/updated
- ✅ Documentation is updated
- ✅ No merge conflicts
- ✅ Branch is up to date with main

### Review Process

- PRs require at least one approval
- Address all review comments
- Be responsive to feedback
- Update the PR as needed

## Testing

### Writing Tests

**Backend**:
```typescript
import { describe, it, expect } from 'vitest'

describe('SermonService', () => {
  it('should return sermon by id', async () => {
    const sermon = await sermonService.getById(1)
    expect(sermon).toBeDefined()
    expect(sermon.id).toBe(1)
  })
})
```

**Android**:
```kotlin
@Test
fun `getSermon returns sermon when found`() = runTest {
  // Given
  val expectedSermon = createMockSermon()
  coEvery { repository.getSermon(1) } returns Result.success(expectedSermon)

  // When
  val result = useCase.execute(1)

  // Then
  assertTrue(result.isSuccess)
  assertEquals(expectedSermon, result.getOrNull())
}
```

### Test Coverage

- Aim for >70% code coverage
- Focus on critical business logic
- Write both unit and integration tests
- Test edge cases and error scenarios

### Running Tests

```bash
# Backend
cd backend
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:cov           # With coverage

# Admin
cd admin
npm test

# Android
cd mobile-android
./gradlew test                      # Unit tests
./gradlew connectedAndroidTest      # Instrumented tests
```

## Documentation

### Code Documentation

- Document public APIs and interfaces
- Add JSDoc/KDoc for complex functions
- Keep documentation up to date with code changes

**TypeScript**:
```typescript
/**
 * Retrieves a sermon by ID
 * @param id - The sermon ID
 * @returns The sermon object
 * @throws {NotFoundError} If sermon doesn't exist
 */
async function getSermon(id: number): Promise<Sermon> {
  // implementation
}
```

**Kotlin**:
```kotlin
/**
 * Retrieves a sermon by ID from the repository
 * @param id The sermon ID
 * @return Result containing the sermon or an error
 */
suspend fun getSermon(id: Long): Result<Sermon>
```

### README Updates

- Update relevant README files for new features
- Add setup instructions for new dependencies
- Document configuration changes

### Architecture Documentation

- Update AGENTS.md for new agents/components
- Document major architectural decisions
- Keep diagrams current

## Questions?

If you have questions or need help:

1. Check existing documentation
2. Search existing issues
3. Ask in discussions
4. Open a new issue

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the SDA Content App! 🙏
