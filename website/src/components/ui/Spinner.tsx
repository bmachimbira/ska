import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn('inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]', {
        'h-4 w-4 border-2': size === 'sm',
        'h-8 w-8': size === 'md',
        'h-12 w-12': size === 'lg',
      }, className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SpinnerPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" className="text-primary-600" />
    </div>
  );
}
