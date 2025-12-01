'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface ChurchProject {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  projectType: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const churchId = params.id as string;
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ChurchProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken && churchId && projectId) {
      fetchProject();
    }
  }, [session, churchId, projectId]);

  const fetchProject = async () => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ project: ChurchProject }>(`/admin/churches/${churchId}/projects/${projectId}`);
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    if (!session?.accessToken) return;

    try {
      const apiClient = createApiClient(session.accessToken);
      await apiClient.delete(`/admin/churches/${churchId}/projects/${projectId}`);
      router.push(`/dashboard/churches/${churchId}/projects`);
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  const progress = getProgress(project.currentAmount, project.goalAmount);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href={`/dashboard/churches/${churchId}/projects`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/churches/${churchId}/projects/${projectId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {!project.isActive && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {project.projectType}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Fundraising Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-1 text-gray-400" />
                  <span className="text-lg font-semibold">
                    {project.currency} {project.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">raised</span>
                </div>
                <div className="text-sm text-gray-500">
                  of {project.currency} {project.goalAmount.toLocaleString()} goal
                </div>
              </div>
            </div>
          </div>

          {(project.startDate || project.endDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Start Date</h3>
                  <p className="text-gray-700">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {project.endDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">End Date</h3>
                  <p className="text-gray-700">{new Date(project.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Created {new Date(project.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
