/**
 * API type definitions matching backend schema
 */

export interface Speaker {
  id: number;
  name: string;
  bio?: string;
  photoUrl?: string;
}

export interface Series {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface MediaAsset {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  size?: number;
  duration?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface Sermon {
  id: number;
  title: string;
  description?: string;
  transcript?: string;
  scriptureRefs?: string[];
  speaker?: Speaker;
  series?: Series;
  tags?: Tag[];
  videoAsset?: MediaAsset;
  audioAsset?: MediaAsset;
  thumbnailAsset?: MediaAsset;
  publishedAt?: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Devotional {
  id: number;
  date: string;
  lang: string;
  slug: string;
  title: string;
  author?: string;
  speaker_id?: number;
  speaker?: Speaker;
  body_md: string;
  content_type: 'text' | 'audio' | 'video';
  audio_asset?: string;
  video_asset?: string;
  audio_asset_details?: {
    id: string;
    kind: string;
    hls_url: string;
    duration_seconds?: number;
    metadata?: any;
  };
  video_asset_details?: {
    id: string;
    kind: string;
    hls_url: string;
    duration_seconds?: number;
    metadata?: any;
  };
  audioAsset?: MediaAsset;
  videoAsset?: MediaAsset;
  viewCount: number;
  view_count?: number;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface Quarterly {
  id: number;
  year: number;
  quarter: number;
  kind: 'adult' | 'youth' | 'kids';
  title: string;
  description?: string;
  coverUrl?: string;
  lang: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  quarterlyId: number;
  indexInQuarter: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  memoryVerse?: string;
  createdAt: string;
  updatedAt: string;
  quarterly?: Quarterly;
  days?: LessonDay[];
}

export interface LessonDay {
  id: number;
  lessonId: number;
  dayIndex: number;
  title: string;
  date?: string;
  memoryVerse?: string;
  bodyMd: string;
  studyAim?: string;
  studyHelp?: string;
  introduction?: string;
  audioAsset?: MediaAsset;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  speaker?: Speaker;
  thumbnailAsset?: MediaAsset;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cause {
  id: number;
  title: string;
  description: string;
  goalAmount?: number;
  raisedAmount: number;
  thumbnailAsset?: MediaAsset;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ChurchAnnouncement {
  id: number;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  expiresAt?: string;
  createdAt: string;
  churchId: number;
  churchName: string;
}

// Home page response
export interface HomePageData {
  featuredSermon?: Sermon;
  recentSermons: Sermon[];
  todayDevotional?: Devotional;
  currentQuarterlies: Quarterly[];
  nextEvent?: Event;
  upcomingEvents?: Event[]; // All upcoming events
  activeCauses: Cause[];
  churchAnnouncements?: ChurchAnnouncement[]; // Only for authenticated church members
}

// Backend pagination format
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Backend list response formats
export interface SermonsResponse {
  sermons: Sermon[];
  pagination: Pagination;
  filters?: {
    search?: string;
    tag?: string;
    series?: string;
    speaker?: string;
  };
}

export interface DevotionalsResponse {
  devotionals: Devotional[];
  pagination: Pagination;
}

export interface QuarterliesResponse {
  quarterlies: Quarterly[];
}

// Legacy type for backwards compatibility
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Error
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}
