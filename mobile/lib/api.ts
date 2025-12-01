import { createApiClient } from '@ska/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const apiClient = createApiClient({
  baseUrl: API_URL,
});
