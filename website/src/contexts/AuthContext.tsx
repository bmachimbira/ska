'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Church {
  id: number;
  name: string;
  city?: string;
}

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  primaryChurch?: Church;
  churches?: Array<{
    churchId: number;
    churchName: string;
    churchCity?: string;
    role: string;
    joinedAt: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

// Helper functions to manage auth token cookie
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Ensure cookie is also set (for existing logged-in users)
        setCookie('authToken', storedToken, 30);

        // Fetch fresh user data to get church information
        await fetchUserData(storedToken);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        // Find primary church (first church in the list, or can be enhanced with isPrimary flag)
        const primaryChurch = userData.churches && userData.churches.length > 0
          ? {
              id: userData.churches[0].churchId,
              name: userData.churches[0].churchName,
              city: userData.churches[0].churchCity,
            }
          : undefined;

        const fullUser = {
          ...userData,
          primaryChurch,
        };

        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserData(token);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCookie('authToken', data.token, 30); // Set cookie for 30 days

    setToken(data.token);
    setUser(data.user);

    // Fetch full user data including church info
    await fetchUserData(data.token);
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCookie('authToken', data.token, 30); // Set cookie for 30 days

    setToken(data.token);
    setUser(data.user);

    // Fetch full user data including church info
    await fetchUserData(data.token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    deleteCookie('authToken'); // Delete the cookie
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
