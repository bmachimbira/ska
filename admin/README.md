# SDA Content App - Admin Panel

> Next.js admin panel for content management

## Overview

Web-based admin interface for managing all content in the SDA Content App:
- Sermon CRUD with media upload
- Devotional management with markdown editor
- Quarterly/lesson/day content management
- Media library
- User and role management
- Analytics dashboard
- Audit logging

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React, Tailwind CSS
- **Forms**: React Hook Form, Zod validation
- **Auth**: NextAuth.js
- **API Client**: Axios or tRPC
- **Markdown**: MDX with live preview
- **Tables**: TanStack Table
- **Charts**: Recharts

## Project Structure

```
admin/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth pages (login, etc.)
│   ├── (dashboard)/           # Protected dashboard pages
│   │   ├── sermons/
│   │   ├── devotionals/
│   │   ├── quarterlies/
│   │   ├── media/
│   │   ├── users/
│   │   └── analytics/
│   ├── api/                   # API routes
│   └── layout.tsx
│
├── components/                 # React components
│   ├── ui/                    # Shadcn UI components
│   ├── forms/                 # Form components
│   ├── tables/                # Data tables
│   └── layout/                # Layout components
│
├── lib/                       # Utilities
│   ├── api.ts                 # API client
│   ├── auth.ts                # Auth helpers
│   ├── validation.ts          # Zod schemas
│   └── utils.ts               # Common utilities
│
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript types
├── public/                    # Static assets
├── styles/                    # Global styles
├── middleware.ts              # Next.js middleware
├── next.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure your .env.local file
```

### Environment Variables

```env
# API
NEXT_PUBLIC_API_BASE=http://localhost:3000/v1

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key

# Database (for NextAuth)
DATABASE_URL=postgresql://user:password@localhost:5432/sda_app
```

### Development

```bash
# Run dev server
npm run dev

# Open http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Authentication

### NextAuth.js Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate against your API
        const user = await validateUser(credentials)
        return user
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    }
  }
}
```

### Role-Based Access Control

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.redirect('/login')
  }

  // Check role permissions
  if (requiresAdmin(request.nextUrl.pathname)) {
    if (session.user.role !== 'super_admin') {
      return NextResponse.redirect('/unauthorized')
    }
  }

  return NextResponse.next()
}
```

### Roles

- **super_admin**: Full access
- **editor**: Content creation and editing
- **uploader**: Media upload only
- **reader**: Read-only access

## Features

### 1. Dashboard

**Overview**
- Total content statistics
- Recent activity
- Quick actions
- Analytics summary

```typescript
export default function DashboardPage() {
  const { data: stats } = useStats()

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Sermons"
        value={stats.sermonsCount}
        icon={<VideoIcon />}
      />
      {/* More stat cards */}
    </div>
  )
}
```

### 2. Content Management

**Sermon Management**

```typescript
'use client'

export function SermonForm({ sermon }: { sermon?: Sermon }) {
  const form = useForm<SermonFormData>({
    resolver: zodResolver(sermonSchema),
    defaultValues: sermon || defaultValues
  })

  const onSubmit = async (data: SermonFormData) => {
    if (sermon) {
      await updateSermon(sermon.id, data)
    } else {
      await createSermon(data)
    }
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* More form fields */}
      <Button type="submit">Save Sermon</Button>
    </Form>
  )
}
```

**Data Tables**

```typescript
export function SermonsTable() {
  const columns: ColumnDef<Sermon>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'speaker.name',
      header: 'Speaker',
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => formatDate(row.original.publishedAt)
    },
    {
      id: 'actions',
      cell: ({ row }) => <SermonActions sermon={row.original} />
    }
  ]

  return <DataTable columns={columns} data={sermons} />
}
```

### 3. Markdown Editor

**Devotional/Lesson Editor**

```typescript
'use client'

export function MarkdownEditor({ value, onChange }: EditorProps) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    // Convert markdown to HTML
    const html = marked(value)
    setPreview(html)
  }, [value])

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono min-h-96"
          placeholder="Write markdown here..."
        />
      </div>
      <div>
        <div
          className="prose prose-sm max-w-none p-4 border rounded-md"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>
    </div>
  )
}
```

### 4. Media Library

**Upload Component**

```typescript
'use client'

export function MediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (files: File[]) => {
    setUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      await axios.post('/api/media/upload', formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total))
        }
      })
    }

    setUploading(false)
  }

  return (
    <div>
      <Dropzone
        onDrop={handleUpload}
        accept={{
          'video/*': ['.mp4', '.mov'],
          'audio/*': ['.mp3', '.m4a'],
          'image/*': ['.jpg', '.png']
        }}
      />
      {uploading && <Progress value={progress} />}
    </div>
  )
}
```

**YouTube Import**

```typescript
export function YouTubeImport() {
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    try {
      const result = await importFromYouTube(url)
      toast.success('Video imported successfully')
    } catch (error) {
      toast.error('Failed to import video')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <Button onClick={handleImport} disabled={importing}>
        {importing ? 'Importing...' : 'Import'}
      </Button>
    </div>
  )
}
```

### 5. Publishing Workflow

**Schedule Publishing**

```typescript
export function PublishingControls({ content }: { content: Content }) {
  const [scheduleDate, setScheduleDate] = useState<Date>()

  const handlePublish = async () => {
    if (scheduleDate) {
      await schedulePublish(content.id, scheduleDate)
    } else {
      await publishNow(content.id)
    }
  }

  return (
    <div className="flex gap-2">
      <DateTimePicker
        value={scheduleDate}
        onChange={setScheduleDate}
        placeholder="Schedule for later"
      />
      <Button onClick={handlePublish}>
        {scheduleDate ? 'Schedule' : 'Publish Now'}
      </Button>
    </div>
  )
}
```

**Feature Toggle**

```typescript
export function FeatureToggle({ sermon }: { sermon: Sermon }) {
  const toggleFeatured = async () => {
    await updateSermon(sermon.id, {
      isFeatured: !sermon.isFeatured
    })
  }

  return (
    <Switch
      checked={sermon.isFeatured}
      onCheckedChange={toggleFeatured}
      aria-label="Feature on homepage"
    />
  )
}
```

### 6. Audit Log

```typescript
export function AuditLog() {
  const { data: logs } = useAuditLogs()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Changes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{formatDateTime(log.timestamp)}</TableCell>
            <TableCell>{log.user.email}</TableCell>
            <TableCell>
              <Badge variant={getActionVariant(log.action)}>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell>
              {log.entityType}: {log.entityId}
            </TableCell>
            <TableCell>
              <ChangesSummary changes={log.changes} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 7. Analytics Dashboard

```typescript
export function AnalyticsDashboard() {
  const { data: analytics } = useAnalytics()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.contentViews}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sermons"
                stroke="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="devotionals"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Content</CardTitle>
        </CardHeader>
        <CardContent>
          <TopContentTable data={analytics.topContent} />
        </CardContent>
      </Card>
    </div>
  )
}
```

## API Integration

### API Client

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

export default api
```

### Data Fetching

```typescript
// Using SWR
import useSWR from 'swr'

export function useSermons(filters?: SermonFilters) {
  const { data, error, mutate } = useSWR(
    ['/sermons', filters],
    ([url, filters]) => api.get(url, { params: filters })
  )

  return {
    sermons: data?.data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}
```

## Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { SermonForm } from './SermonForm'

describe('SermonForm', () => {
  it('renders all fields', () => {
    render(<SermonForm />)

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Speaker')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<SermonForm />)

    const submit = screen.getByText('Save Sermon')
    await userEvent.click(submit)

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
// Using Playwright
import { test, expect } from '@playwright/test'

test('admin can create sermon', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'admin@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  await page.goto('/sermons/new')
  await page.fill('[name=title]', 'Test Sermon')
  await page.fill('[name=description]', 'Test description')
  await page.click('button[type=submit]')

  await expect(page).toHaveURL(/\/sermons\/\d+/)
})
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Security

- CSRF protection
- XSS prevention
- Secure session management
- Role-based access control
- Input validation
- Rate limiting

## Performance

- Static page generation where possible
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## Contributing

1. Follow React best practices
2. Use TypeScript for all new code
3. Write tests for components
4. Use Tailwind for styling
5. Keep components small and focused

## License

[To be determined]

---

**Maintainer**: Admin Team
**Last Updated**: 2025-11-18
