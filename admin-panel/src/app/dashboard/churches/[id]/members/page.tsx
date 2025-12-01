'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: number;
  role: string;
  isPrimary: boolean;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const ROLES = [
  { value: 'member', label: 'Member', color: 'gray' },
  { value: 'elder', label: 'Elder', color: 'blue' },
  { value: 'deacon', label: 'Deacon', color: 'green' },
  { value: 'pastor', label: 'Pastor', color: 'purple' },
  { value: 'admin', label: 'Admin', color: 'red' },
];

export default function ChurchMembersPage() {
  const params = useParams();
  const churchId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [churchId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/churches/${churchId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (memberId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/churches/${churchId}/members/${memberId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) throw new Error('Failed to update role');

      // Refresh members list
      fetchMembers();
    } catch (err) {
      alert('Failed to update member role');
      console.error(err);
    }
  };

  const removeMember = async (memberId: number, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this church?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/churches/${churchId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to remove member');

      // Refresh members list
      fetchMembers();
    } catch (err) {
      alert('Failed to remove member');
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    return roleConfig?.color || 'gray';
  };

  const filteredMembers = members.filter((member) =>
    member.user.name.toLowerCase().includes(search.toLowerCase()) ||
    member.user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/churches/${churchId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Church
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Church Members</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage roles and permissions for church members
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.user.name}
                    </div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value)}
                    className={`text-sm font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 bg-${getRoleColor(
                      member.role
                    )}-100 text-${getRoleColor(member.role)}-800`}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.isPrimary && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Primary Church
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => removeMember(member.id, member.user.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'This church has no members yet'}
            </p>
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <div key={role.value} className="flex items-start">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${role.color}-100 text-${role.color}-800 mr-3`}
              >
                {role.label}
              </span>
              <p className="text-sm text-gray-600">
                {role.value === 'member' && 'Can view church content'}
                {role.value === 'elder' && 'Can create devotionals and announcements'}
                {role.value === 'deacon' && 'Can manage events and elder permissions'}
                {role.value === 'pastor' && 'Full content creation and member management'}
                {role.value === 'admin' && 'Full church management and settings'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
