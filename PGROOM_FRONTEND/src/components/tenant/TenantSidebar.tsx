import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Building2,
  CreditCard,
  HelpCircle,
  ChevronRight,
  User,
  Loader2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTenantRoomStatus } from '@/hooks/useTenantRoomStatus';

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
}

interface TenantSidebarProps {
  collapsed?: boolean;
}

/**
 * TenantSidebar - Navigation sidebar for the tenant dashboard
 * @param collapsed - Whether the sidebar is in collapsed state (icons only)
 */
const TenantSidebar: React.FC<TenantSidebarProps> = ({ collapsed = false }) => {
  // Get tenant room status for conditional navigation
  const { hasRoom, isLoading } = useTenantRoomStatus();

  // Base navigation items - only show dashboard if tenant has a room
  const baseNavItems: NavItemProps[] = [];
  
  if (!isLoading && hasRoom) {
    baseNavItems.push({
      name: 'Dashboard',
      path: '/tenant/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    });
  }

  // Conditional navigation items based on room assignment
  const conditionalNavItems: NavItemProps[] = [];
  
  if (isLoading) {
    // Show loading state
    conditionalNavItems.push({
      name: 'Loading...',
      path: '#',
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });
  } else if (hasRoom) {
    // Tenant has room assigned - show Room option
    conditionalNavItems.push({
      name: 'My Room',
      path: '/tenant/room',
      icon: <Home className="w-5 h-5" />,
    });
  } else {
    // Tenant has no room assigned - show Properties option
    conditionalNavItems.push({
      name: 'Properties',
      path: '/tenant/properties',
      icon: <Building2 className="w-5 h-5" />,
    });
  }

  // Other main navigation items - only show if tenant has a room
  const otherMainNavItems: NavItemProps[] = [];
  
  if (!isLoading && hasRoom) {
    // Only show these items if tenant has a room assigned
    otherMainNavItems.push(
      {
        name: 'Payments',
        path: '/tenant/payments',
        icon: <CreditCard className="w-5 h-5" />,
      }
    );
  }

  // Combine main navigation items
  const mainNavItems = [...baseNavItems, ...conditionalNavItems, ...otherMainNavItems];

  // Secondary navigation items - always available
  const secondaryNavItems: NavItemProps[] = [
    {
      name: 'Profile',
      path: '/tenant/profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Support',
      path: '/tenant/support',
      icon: <HelpCircle className="w-5 h-5" />,
    }
  ];

  // Render individual nav item
  const renderNavItem = (item: NavItemProps) => {
    // Disable loading item
    const isDisabled = item.path === '#';
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        title={item.name}
        className={({ isActive }) =>
          cn(
            'flex items-center text-sm font-medium rounded-md transition-colors duration-200',
            'group hover:bg-gray-100 dark:hover:bg-gray-800',
            collapsed ? 'justify-center p-3' : 'px-3 py-2',
            isDisabled && 'pointer-events-none cursor-not-allowed opacity-50',
            isActive && !isDisabled
              ? 'bg-primary/10 text-primary border-r-2 border-primary'
              : 'text-gray-700 dark:text-gray-300'
          )
        }
        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
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
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[hsl(var(--background-light-dark))] border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      {!collapsed && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Tenant Panel
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find Your Home
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
            Settings & Support
          </h3>
        </div>
      )}
      <nav className={cn(
        "flex-none",
        collapsed ? "flex flex-col items-center px-0" : "space-y-1 px-3"
      )}>
        {secondaryNavItems.map(renderNavItem)}
      </nav>

      {/* Footer - Tenant Badge */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {hasRoom ? 'Active Tenant' : 'Room Seeker'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasRoom ? 'Manage Your Stay' : 'Find Your Room'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSidebar;
