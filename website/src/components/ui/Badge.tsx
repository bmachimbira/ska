import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'sermon' | 'devotional' | 'quarterly' | 'secondary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300':
            variant === 'default',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300':
            variant === 'sermon',
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
            variant === 'devotional',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
            variant === 'quarterly',
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300':
            variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
}
