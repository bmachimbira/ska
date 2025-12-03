# Authentication Redirect Migration Guide

This guide explains how to update admin panel pages to redirect to login instead of showing "Not authenticated" error banners.

## Summary of Changes

Instead of showing an error banner when users are not authenticated, pages now automatically redirect to the login page using the `useRequireAuth` hook.

## Files Already Updated ✅

- ✅ `/src/app/dashboard/devotionals/new/page.tsx`
- ✅ `/src/app/dashboard/devotionals/[id]/edit/page.tsx`

## Files Still Need Updating

Run this command to see all files with "Not authenticated":
```bash
grep -r "Not authenticated" src/app/dashboard --include="*.tsx" -l
```

## Migration Steps

For each file that needs updating, follow these steps:

### Step 1: Update Imports

**Before:**
```typescript
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
```

**After:**
```typescript
import { createApiClient } from '@/lib/api-client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
```

### Step 2: Replace useSession Hook

**Before:**
```typescript
export default function MyPage() {
  const { data: session } = useSession();
  const [error, setError] = useState('');
```

**After:**
```typescript
export default function MyPage() {
  const { session, isLoading: authLoading } = useRequireAuth();
```

### Step 3: Remove Authentication Checks

**Before:**
```typescript
async function loadData() {
  try {
    if (!session?.accessToken) { setError("Not authenticated."); return; }

    const apiClient = createApiClient(session.accessToken as string);
    // ... rest of code
  }
}
```

**After:**
```typescript
async function loadData() {
  try {
    if (!session?.accessToken) return; // Wait for auth to load

    const apiClient = createApiClient(session.accessToken as string);
    // ... rest of code
  }
}
```

### Step 4: Update Form Submit Handlers

**Before:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!session?.accessToken) { setError("Not authenticated."); return; }

    const apiClient = createApiClient(session.accessToken as string);
    // ... rest of code
  }
}
```

**After:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!session?.accessToken) return; // Should never happen due to useRequireAuth

  setLoading(true);

  try {
    const apiClient = createApiClient(session.accessToken as string);
    // ... rest of code
  }
}
```

### Step 5: Remove Error Banner from JSX

**Before:**
```tsx
return (
  <div className="p-8">
    {/* Error */}
    {error && (
      <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    )}

    {/* Rest of content */}
  </div>
);
```

**After:**
```tsx
// Add loading state check before return
if (authLoading) {
  return (
    <div className="p-8">
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

return (
  <div className="p-8">
    {/* Error banner removed - or keep for non-auth errors */}
    {/* Rest of content */}
  </div>
);
```

### Step 6: Update Existing Loading States (if applicable)

If the page already has a loading state for data:

**Before:**
```typescript
if (loading) {
  return <LoadingSpinner />;
}
```

**After:**
```typescript
if (authLoading || loading) {
  return <LoadingSpinner />;
}
```

## How useRequireAuth Works

The `useRequireAuth` hook automatically:
1. Checks if user is authenticated
2. Redirects to `/auth/signin?callbackUrl=[current-page]` if not authenticated
3. Returns session data and loading state

### Hook API

```typescript
const { session, isAuthenticated, isLoading } = useRequireAuth();

// session: The NextAuth session object with accessToken
// isAuthenticated: Boolean indicating if user has valid accessToken
// isLoading: Boolean indicating if auth check is in progress
```

## Benefits

1. **Better UX**: Users are automatically redirected instead of seeing errors
2. **Cleaner Code**: No need for manual auth checks and error states
3. **Consistent**: All pages handle auth the same way
4. **Callback Support**: Users return to their intended page after login

## Example: Complete Before/After

See the updated files for complete examples:
- `src/app/dashboard/devotionals/new/page.tsx`
- `src/app/dashboard/devotionals/[id]/edit/page.tsx`

## Note on Error States

If you have other types of errors besides authentication (like API errors), you can keep the error state and banner, just remove the authentication-related error setting:

```typescript
// Keep error state for other errors
const [error, setError] = useState('');

// Remove auth-related setError calls
// setError("Not authenticated."); ❌ Remove this

// Keep other error handling
catch (error) {
  setError('Failed to load data'); // ✅ Keep this
}
```
