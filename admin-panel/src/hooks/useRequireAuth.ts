/**
 * Hook to require authentication and redirect to login if not authenticated
 */

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Don't redirect while loading

    if (status === 'unauthenticated' || !session?.accessToken) {
      // Redirect to login page with callback to current page
      const currentPath = window.location.pathname;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [status, session, router]);

  return {
    session,
    isAuthenticated: !!session?.accessToken,
    isLoading: status === 'loading',
  };
}
