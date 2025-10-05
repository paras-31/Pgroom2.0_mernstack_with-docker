import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface NavItemProps {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
}

export interface SidebarSectionProps {
  title: string;
  items: NavItemProps[];
}

export interface BaseSidebarProps {
  collapsed?: boolean;
  title: string;
  description?: string;
  sections: SidebarSectionProps[];
  profileComponent?: React.ReactNode;
}

/**
 * BaseSidebar - Base component for all sidebar implementations
 * 
 * This component provides the core functionality for sidebars with
 * collapsible behavior and consistent styling.
 */
const BaseSidebar: React.FC<BaseSidebarProps> = ({
  collapsed = false,
  title,
  description,
  sections,
  profileComponent,
}) => {
  // Render a navigation item
  const renderNavItem = (item: NavItemProps) => (
    <NavLink
      key={item.path}
      to={item.path}
      title={item.name}
      className={({ isActive }) =>
        cn(
          'flex items-center text-sm font-medium rounded-md transition-colors',
          'group hover:bg-gray-100 dark:hover:bg-gray-800',
          collapsed ? 'justify-center h-10 w-10 mx-auto my-1' : 'justify-between px-3 py-2',
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
            : 'text-gray-700 dark:text-gray-300'
        )
      }
    >
      <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
        <span className={cn(
          "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary",
          collapsed ? "" : "mr-3"
        )}>
          {item.icon}
        </span>
        {!collapsed && (
          <span>{item.name}</span>
        )}
        {!collapsed && item.isNew && (
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
            New
          </Badge>
        )}
      </div>
      {!collapsed && item.badge && (
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  );

  return (
    <div className={cn(
      "h-full flex flex-col overflow-y-auto",
      collapsed ? "py-4" : "py-6"
    )}>
      {/* Header - only show in expanded mode */}
      {!collapsed && title && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      {sections.map((section, index) => (
        <React.Fragment key={section.title}>
          {/* Section Title - only show in expanded mode */}
          {!collapsed && (
            <div className="px-3 mb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
          )}
          
          {/* Navigation Items */}
          <nav className={cn(
            "flex-none",
            collapsed ? "flex flex-col items-center px-0" : "space-y-1 px-3",
            index < sections.length - 1 ? "mb-8" : ""
          )}>
            {section.items.map(renderNavItem)}
          </nav>
        </React.Fragment>
      ))}

      {/* Profile Component - only show in expanded mode */}
      {!collapsed && profileComponent && (
        <div className="px-3 mt-auto pt-6">
          {profileComponent}
        </div>
      )}
    </div>
  );
};

export default BaseSidebar;
