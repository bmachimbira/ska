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
  title: string;
  author?: string;
  memoryVerse: string;
  content: string;
  audioAsset?: MediaAsset;
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
  memoryVerse?: string;
  content: string;
  audioAsset?: MediaAsset;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name?: string;
  role: 'super_admin' | 'editor' | 'uploader' | 'reader';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  adminUserId: number;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Paginated list response
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
