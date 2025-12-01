# SKA Zimbabwe Website

A modern, full-featured public-facing website for the Zimbabwe Conference of Sabbath Keeping Adventists built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Homepage** - Hero section, featured content, today's devotional, current quarterlies
- 🎥 **Sermons** - Browse, search, filter, and watch video sermons with transcripts
- 📖 **Daily Devotionals** - Read today's devotional or browse the archive
- 📚 **Sabbath School** - Access quarterly lessons for all ages (Adult, Youth, Kids)
- 🔍 **Search** - Find content across the entire library
- 🎨 **Distinct Design** - Professional spiritual theme with deep blues/purples and warm gold accents

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Media Players:** react-player (video), custom HTML5 (audio)
- **Markdown:** react-markdown + remark-gfm
- **Icons:** lucide-react
- **Date Handling:** date-fns

## Project Structure

```
website/
├── src/
│   ├── app/                      # Pages (App Router)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   ├── sermons/              # Sermons section
│   │   ├── devotionals/          # Devotionals section
│   │   ├── sabbath-school/       # Sabbath School section
│   │   ├── search/               # Search page
│   │   └── about/                # About page
│   ├── components/
│   │   ├── layout/               # Header, Footer
│   │   ├── ui/                   # Reusable UI components
│   │   ├── content/              # Content-specific cards
│   │   └── media/                # Video & Audio players
│   ├── lib/
│   │   ├── api-client.ts         # API client (no auth)
│   │   ├── utils.ts              # Utility functions
│   │   └── constants.ts          # App constants
│   └── types/
│       └── api.ts                # TypeScript types
└── public/                       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The website will be available at `http://localhost:3200`

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_APP_NAME="SKA"
NEXT_PUBLIC_SITE_URL=http://localhost:3200
```

## Available Scripts

- `npm run dev` - Start development server on port 3200
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Pages & Routes

| Route | Description | Rendering |
|-------|-------------|-----------|
| `/` | Homepage | ISR (60s) |
| `/sermons` | Sermons listing | SSR |
| `/sermons/[id]` | Sermon detail | SSG + ISR |
| `/devotionals/today` | Today's devotional | ISR (5min) |
| `/devotionals` | Devotionals archive | SSR |
| `/devotionals/[id]` | Devotional detail | SSG + ISR |
| `/sabbath-school` | Quarterlies listing | ISR (1hr) |
| `/sabbath-school/[id]` | Quarterly detail | SSG + ISR |
| `/search` | Search page | CSR |
| `/about` | About page | SSG |

## Design System

### Colors

- **Primary:** Deep blue/purple (#6366f1) - Trust & spirituality
- **Secondary:** Warm gold (#f59e0b) - Highlights & accents
- **Content Categories:**
  - Sermons: Blue (#6366f1)
  - Devotionals: Green (#10b981)
  - Quarterlies: Amber (#f59e0b)

### Typography

- **Headings:** Inter (sans-serif)
- **Body:** Merriweather (serif) for readable content
- **UI:** Inter for navigation and UI elements

## Key Features

### Video & Audio Playback
- Video player using react-player with play/pause, seek, volume controls
- Custom HTML5 audio player with styled controls
- Support for multiple formats and streaming protocols

### Responsive Design
- Mobile-first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly controls
- Hamburger menu for mobile navigation

### SEO Optimization
- Dynamic meta tags per page
- Open Graph tags for social sharing
- Structured data (VideoObject, Article)
- ISR for fresh content with SEO benefits

### Performance
- Next.js Image component for optimized images
- Code splitting (automatic with App Router)
- ISR for semi-static content
- Lazy loading for below-fold content

## Development Notes

- API client is simplified (no authentication required for public endpoints)
- All types are synced from admin-panel
- Uses Next.js 16 App Router with Server Components
- Implements hybrid rendering (SSG, ISR, SSR, CSR) based on content needs

## License

Private - All rights reserved
