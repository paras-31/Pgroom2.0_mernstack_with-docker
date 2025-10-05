import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  HelpCircle,
  ChevronRight,
  User,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
}

interface OwnerSidebarProps {
  collapsed?: boolean;
}

/**
 * OwnerSidebar - Navigation sidebar for the owner dashboard
 * @param collapsed - Whether the sidebar is in collapsed state (icons only)
 */
const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ collapsed = false }) => {
  // Main navigation items
  const mainNavItems: NavItemProps[] = [
    {
      name: 'Dashboard',
      path: '/owner/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Properties',
      path: '/owner/properties',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Tenants',
      path: '/owner/tenants',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Secondary navigation items
  const secondaryNavItems: NavItemProps[] = [
    {
      name: 'Payments',
      path: '/owner/payments',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      name: 'Profile',
      path: '/owner/profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Help & Support',
      path: '/owner/support',
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  // Render a navigation item
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
          {item.isNew && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
              New
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
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Owner Panel
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Property Management
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

      {/* Secondary Navigation */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Management
          </h3>
        </div>
      )}
      <nav className={cn(
        "flex-none",
        collapsed ? "flex flex-col items-center px-0" : "space-y-1 px-3"
      )}>
        {secondaryNavItems.map(renderNavItem)}
      </nav>

      {/* Footer - Owner Badge */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
            <Building className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Property Owner
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage Properties
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerSidebar;
