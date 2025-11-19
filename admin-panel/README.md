# SDA Admin Panel

Content Management System for the SDA Content App built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication & Authorization**
  - NextAuth.js with credentials provider
  - Role-based access control (Super Admin, Editor, Uploader, Reader)
  - Secure session management

- **Content Management**
  - Sermon CRUD with media management
  - Devotional editor with Markdown preview
  - Quarterly/Lesson/Day hierarchy management
  - Media library with drag-and-drop upload

- **User Interface**
  - Responsive design with Tailwind CSS
  - Dark mode support
  - Modern dashboard layout
  - Real-time markdown preview

- **Developer Experience**
  - TypeScript for type safety
  - React Query for data fetching
  - ESLint for code quality
  - Hot module replacement

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **Markdown**: react-markdown + remark-gfm
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Backend API running on port 3001 (see `../backend`)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_NAME="SDA Admin Panel"
NEXT_PUBLIC_API_URL=http://localhost:3001/v1

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars-change-me

BACKEND_API_URL=http://localhost:3001/v1
BACKEND_API_KEY=your-backend-api-key
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
admin-panel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── sermons/       # Sermon management
│   │   │   ├── devotionals/   # Devotional management
│   │   │   ├── quarterlies/   # Quarterly management
│   │   │   └── media/         # Media library
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects)
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── providers.tsx      # App providers
│   ├── lib/                   # Utility functions
│   │   ├── api-client.ts      # API client
│   │   ├── auth.ts            # Auth configuration
│   │   ├── rbac.ts            # Role-based access control
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript types
│       └── api.ts             # API type definitions
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Role-Based Access Control

The system supports 4 roles with hierarchical permissions:

### 1. Reader
- Read-only access to all content
- Cannot create, edit, or delete

### 2. Uploader
- Reader permissions +
- Upload media files
- Update media metadata

### 3. Editor
- Uploader permissions +
- Create and edit sermons
- Create and edit devotionals
- Create and edit quarterlies
- Cannot delete content

### 4. Super Admin
- Full access to all features
- User management
- Delete content
- Audit log access
- System configuration

## Key Pages

### Dashboard (`/dashboard`)
- Overview statistics
- Recent activity
- Quick actions

### Sermons (`/dashboard/sermons`)
- List all sermons
- Create new sermon
- Edit sermon details
- Manage media attachments
- Toggle featured status

### Devotionals (`/dashboard/devotionals`)
- Daily devotional management
- Markdown editor with live preview
- Memory verse field
- Audio upload support

### Quarterlies (`/dashboard/quarterlies`)
- Manage quarterly structure
- Lesson management
- Day-by-day content editing
- Bulk operations

### Media Library (`/dashboard/media`)
- Drag-and-drop upload
- Video, audio, and image support
- Search and filter
- Copy URLs for content attachment

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Tailwind CSS utilities
- Prefer server components when possible
- Use client components only when needed (state, events, browser APIs)

## API Integration

The admin panel communicates with the backend API at `NEXT_PUBLIC_API_URL`.

### Authentication Flow

1. User submits credentials via `/auth/signin`
2. NextAuth sends request to `/v1/admin/auth/login`
3. Backend validates and returns JWT token
4. Token stored in session and sent with all API requests

### API Client Usage

```typescript
import { createApiClient } from '@/lib/api-client';

// Client-side (uses session token automatically)
import { apiClient } from '@/lib/api-client';
const data = await apiClient.get('/sermons');

// Server-side (provide token explicitly)
const apiClient = createApiClient(session.accessToken);
const data = await apiClient.get('/sermons');
```

## Future Enhancements

- [ ] 2FA support (TOTP)
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Advanced analytics dashboard
- [ ] Scheduled publishing
- [ ] Draft preview
- [ ] Bulk import/export
- [ ] YouTube integration for video upload
- [ ] Image optimization pipeline
- [ ] CDN integration

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

Proprietary - All rights reserved
