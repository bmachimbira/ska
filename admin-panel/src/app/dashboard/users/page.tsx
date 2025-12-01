'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'red' },
  { value: 'editor', label: 'Editor', color: 'blue' },
  { value: 'uploader', label: 'Uploader', color: 'green' },
  { value: 'reader', label: 'Reader', color: 'gray' },
];

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<{ users: User[] }>('/admin/users');
      setUsers(data.users || []);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    return roleConfig?.color || 'gray';
  };

  const getRoleLabel = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    return roleConfig?.label || role;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage admin panel users and permissions
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(
                      user.role
                    )}-100 text-${getRoleColor(user.role)}-800 dark:bg-${getRoleColor(
                      user.role
                    )}-900/20 dark:text-${getRoleColor(user.role)}-400`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/dashboard/users/${user.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete user ${user.name}?`)) {
                          // TODO: Implement delete
                        }
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search ? 'Try adjusting your search' : 'Get started by creating a new user'}
            </p>
            {!search && (
              <div className="mt-6">
                <Link
                  href="/dashboard/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add User
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Role Permissions
        </h3>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <div key={role.value} className="flex items-start">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${role.color}-100 text-${role.color}-800 dark:bg-${role.color}-900/20 dark:text-${role.color}-400 mr-3`}
              >
                {role.label}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {role.value === 'super_admin' &&
                  'Full system access - can manage everything including users'}
                {role.value === 'editor' &&
                  'Can create and edit all content (sermons, devotionals, events, churches)'}
                {role.value === 'uploader' && 'Can upload and manage media files'}
                {role.value === 'reader' && 'Read-only access to view content'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
