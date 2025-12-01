'use client';

import { useState, useEffect } from 'react';
import { X, Church } from 'lucide-react';

interface Church {
  id: number;
  name: string;
  city?: string;
}

interface JoinChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinChurchModal({ isOpen, onClose, onSuccess }: JoinChurchModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [fetchingChurches, setFetchingChurches] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChurches();
    }
  }, [isOpen]);

  const fetchChurches = async () => {
    setFetchingChurches(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const response = await fetch(`${apiUrl}/churches`);
      const data = await response.json();

      if (response.ok) {
        setChurches(data.churches || []);
      }
    } catch (err) {
      console.error('Failed to fetch churches:', err);
    } finally {
      setFetchingChurches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChurchId) {
      setError('Please select a church');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please sign in first');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const response = await fetch(`${apiUrl}/auth/join-church`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ churchId: parseInt(selectedChurchId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join church');
      }

      onSuccess();
      onClose();
      setSelectedChurchId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join church');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Church className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Join a Church</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Church
            </label>
            {fetchingChurches ? (
              <div className="text-center py-4 text-gray-500">Loading churches...</div>
            ) : (
              <select
                required
                value={selectedChurchId}
                onChange={(e) => setSelectedChurchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a church --</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name}{church.city ? ` - ${church.city}` : ''}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Choose the church you would like to join
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Joining...' : 'Join Church'}
          </button>
        </form>
      </div>
    </div>
  );
}
