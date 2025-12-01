'use client';

import { useState, useEffect } from 'react';
import { Shield, User, Calendar, Filter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resourceId?: number;
  userId: number;
  userName: string;
  userEmail: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (session?.accessToken) {
      fetchLogs();
    }
  }, [session, filter]);

  const fetchLogs = async () => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ logs: AuditLog[] }>(`/admin/audit?filter=${filter}`);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all administrative actions and changes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {logs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => (
              <li key={log.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.resource}
                        {log.resourceId && ` #${log.resourceId}`}
                      </span>
                    </div>
                    
                    {log.details && (
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{log.userName} ({log.userEmail})</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.ipAddress && (
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span>{log.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Audit logs will appear here as actions are performed'
                : `No ${filter} actions found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
