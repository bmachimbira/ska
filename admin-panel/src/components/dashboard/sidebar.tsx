'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { hasPermission, type Role } from '@/lib/rbac';
import {
  Home,
  Video,
  BookOpen,
  Book,
  Upload,
  Users,
  FileText,
  BarChart3,
  Mic,
  Calendar,
  Heart,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Sermons',
    href: '/dashboard/sermons',
    icon: Video,
    resource: 'sermons',
    action: 'read',
  },
  {
    label: 'Speakers',
    href: '/dashboard/speakers',
    icon: Mic,
    resource: 'speakers',
    action: 'read',
  },
  {
    label: 'Events',
    href: '/dashboard/events',
    icon: Calendar,
    resource: 'events',
    action: 'read',
  },
  {
    label: 'Causes',
    href: '/dashboard/causes',
    icon: Heart,
    resource: 'causes',
    action: 'read',
  },
  {
    label: 'Devotionals',
    href: '/dashboard/devotionals',
    icon: BookOpen,
    resource: 'devotionals',
    action: 'read',
  },
  {
    label: 'Quarterlies',
    href: '/dashboard/quarterlies',
    icon: Book,
    resource: 'quarterlies',
    action: 'read',
  },
  {
    label: 'Media Library',
    href: '/dashboard/media',
    icon: Upload,
    resource: 'media',
    action: 'read',
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    resource: 'users',
    action: 'read',
  },
  {
    label: 'Audit Logs',
    href: '/dashboard/audit',
    icon: FileText,
    resource: 'audit',
    action: 'read',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    resource: 'sermons',
    action: 'read',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as Role;

  // Filter navigation items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (!item.resource || !item.action) return true;
    return userRole && hasPermission(userRole, item.resource, item.action);
  });

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">SDA Admin</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
