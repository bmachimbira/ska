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
  memoryVerse: string;
  content: string;
  audioAsset?: MediaAsset;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
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
  lessonNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  memoryVerse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonDay {
  id: number;
  lessonId: number;
  dayIndex: number;
  title: string;
  date?: string;
  memoryVerse?: string;
  content: string;
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

// Home page response
export interface HomePageData {
  featuredSermon?: Sermon;
  recentSermons: Sermon[];
  todayDevotional?: Devotional;
  currentQuarterlies: Quarterly[];
  nextEvent?: Event;
  activeCauses: Cause[];
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
