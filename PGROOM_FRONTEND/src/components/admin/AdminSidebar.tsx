import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  CreditCard,
  Shield,
  User,
  UserCheck,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface AdminSidebarProps {
  collapsed?: boolean;
}

/**
 * AdminSidebar - Navigation sidebar for the admin dashboard
 * @param collapsed - Whether the sidebar is in collapsed state (icons only)
 */
const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false }) => {
  // Main navigation items
  const mainNavItems: NavItemProps[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Properties',
      path: '/admin/properties',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Owners',
      path: '/admin/owners',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      name: 'Tenants',
      path: '/admin/tenants',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Payments',
      path: '/admin/payments',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  // System navigation items
  const systemNavItems: NavItemProps[] = [
    {
      name: 'Profile Settings',
      path: '/admin/profile',
      icon: <User className="w-5 h-5" />,
    }
  ];

  // Render individual nav item
  const renderNavItem = (item: NavItemProps) => (
    <NavLink
      key={item.path}
      to={item.path}
      title={item.name}
      className={({ isActive }) =>
        cn(
          'flex items-center text-sm font-medium rounded-md transition-colors duration-200',
          'group hover:bg-gray-100 dark:hover:bg-gray-800',
          collapsed ? 'justify-center p-3' : 'px-3 py-2',
          isActive
            ? 'bg-primary/10 text-primary border-r-2 border-primary'
            : 'text-gray-700 dark:text-gray-300'
        )
      }
    >
      <div className={cn("flex-shrink-0", !collapsed && "mr-3")}>
        {item.icon}
      </div>
      {!collapsed && (
        <div className="flex items-center justify-between w-full">
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {item.badge}
            </Badge>
          )}
        </div>
      )}
    </NavLink>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[hsl(var(--background-light-dark))] border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      {!collapsed && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System Management
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      {!collapsed && (
        <div className="px-3 mb-2 mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main
          </h3>
        </div>
      )}
      <nav className={cn(
        "flex-none",
        collapsed ? "flex flex-col items-center px-0" : "space-y-1 px-3",
        "mb-8"
      )}>
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* System Navigation */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            System
          </h3>
        </div>
      )}
      <nav className={cn(
        "flex-none",
        collapsed ? "flex flex-col items-center px-0" : "space-y-1 px-3"
      )}>
        {systemNavItems.map(renderNavItem)}
      </nav>

      {/* Footer - Admin Badge */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
            <Shield className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Super Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Full Access
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
