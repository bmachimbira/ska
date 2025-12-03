/**
 * API type definitions matching backend schema
 */

export interface Speaker {
  id: number;
  name: string;
  bio?: string;
  photoUrl?: string;
  userId?: number; // Reference to app_user (church member)
  isGuest: boolean; // True if guest speaker from another church
  guestChurchName?: string; // Name of guest speaker's church
  guestChurchLocation?: string; // Location of guest speaker's church
  contactEmail?: string; // Contact email for guest speakers
  contactPhone?: string; // Contact phone for guest speakers
  primaryChurch?: {
    id: number;
    name: string;
    slug: string;
    city: string;
  };
}

export interface Series {
  id: number;
  title: string;
  description?: string;
  speaker_id?: number;
  speaker?: Pick<Speaker, 'id' | 'name' | 'bio' | 'photoUrl'>;
  hero_image?: string;
  hero_image_details?: {
    id: string;
    kind: string;
    hls_url: string;
    download_url: string;
  };
  sermon_count?: number;
  created_at?: string;
  updatedAt?: string;
  // Legacy field for backwards compatibility
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
  // Church-specific content (if user is a member)
  churchData?: ChurchHomeData;
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

// ============================================================================
// CHURCH SYSTEM TYPES
// ============================================================================

export interface Church {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  logoAsset?: MediaAsset;
  coverAsset?: MediaAsset;
  timezone: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatarAsset?: MediaAsset;
  primaryChurchId?: number;
  primaryChurch?: Church;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChurchRole = 'member' | 'elder' | 'deacon' | 'pastor' | 'admin';

export interface ChurchMember {
  id: number;
  userId: number;
  churchId: number;
  user?: User;
  church?: Church;
  role: ChurchRole;
  isPrimary: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchDevotional {
  id: number;
  churchId: number;
  authorId: number;
  church?: Church;
  author?: User;
  title: string;
  bodyMd: string;
  scriptureRefs?: string[];
  audioAsset?: MediaAsset;
  date: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'worship' | 'prayer' | 'study' | 'social' | 'outreach' | 'youth' | 'other';

export interface ChurchEvent {
  id: number;
  churchId: number;
  church?: Church;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  speaker?: Speaker;
  thumbnailAsset?: MediaAsset;
  eventType: EventType;
  maxAttendees?: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  attendeeCount?: number;
  isRegistered?: boolean;
}

export type ProjectType = 'fundraising' | 'volunteer' | 'mission' | 'building' | 'community' | 'other';

export interface ChurchProject {
  id: number;
  churchId: number;
  church?: Church;
  title: string;
  description: string;
  goalAmount?: number;
  raisedAmount: number;
  currency: string;
  thumbnailAsset?: MediaAsset;
  startDate?: string;
  endDate?: string;
  projectType: ProjectType;
  isActive: boolean;
  isFeatured: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  progressPercentage?: number;
}

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ChurchAnnouncement {
  id: number;
  churchId: number;
  church?: Church;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  expiresAt?: string;
  isPublished: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled';

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  event?: ChurchEvent;
  user?: User;
  status: RegistrationStatus;
  guestsCount: number;
  notes?: string;
  registeredAt: string;
}

export type ContributionType = 'monetary' | 'volunteer' | 'material';

export interface ProjectContribution {
  id: number;
  projectId: number;
  userId?: number;
  project?: ChurchProject;
  user?: User;
  contributionType: ContributionType;
  amount?: number;
  currency: string;
  hours?: number;
  description?: string;
  isAnonymous: boolean;
  contributedAt: string;
}

export interface ChurchInvitation {
  id: number;
  churchId: number;
  church?: Church;
  code: string;
  createdBy?: number;
  maxUses?: number;
  usesCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

// Response types
export interface ChurchHomeData {
  church: Church;
  membership: ChurchMember;
  todayDevotional?: ChurchDevotional;
  upcomingEvents: ChurchEvent[];
  activeProjects: ChurchProject[];
  announcements: ChurchAnnouncement[];
}

export interface ChurchesResponse {
  churches: Church[];
  pagination?: Pagination;
}

export interface ChurchEventsResponse {
  events: ChurchEvent[];
  pagination?: Pagination;
}

export interface ChurchProjectsResponse {
  projects: ChurchProject[];
  pagination?: Pagination;
}

export interface ChurchDevotionalsResponse {
  devotionals: ChurchDevotional[];
  pagination?: Pagination;
}

// Admin API Response Types
export interface SpeakersResponse {
  speakers: Speaker[];
  pagination?: Pagination;
}

export interface SeriesResponse {
  series: Series[];
  pagination?: Pagination;
}
