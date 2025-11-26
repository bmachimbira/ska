/**
 * Application constants
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'SKA Zimbabwe';
export const FULL_CHURCH_NAME = 'Zimbabwe Conference of Sabbath Keeping Adventists';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3200';

export const QUARTERLY_KINDS = {
  adult: 'Adult',
  youth: 'Youth',
  kids: 'Kids',
} as const;

export const LESSON_DAYS = [
  'Sabbath',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const REVALIDATE_TIMES = {
  home: 60, // 1 minute
  devotionalToday: 300, // 5 minutes
  sermonsList: 0, // SSR
  sermonDetail: 3600, // 1 hour
  quarterlies: 3600, // 1 hour
  lessons: 3600, // 1 hour
} as const;
