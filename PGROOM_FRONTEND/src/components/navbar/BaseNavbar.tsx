import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export interface BaseNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
  logo?: React.ReactNode;
  title: string;
  rightContent?: React.ReactNode;
}

/**
 * BaseNavbar - Base component for all navbar implementations
 * 
 * This component provides the core functionality for navbars with
 * sidebar toggle and theme switching.
 */
const BaseNavbar: React.FC<BaseNavbarProps> = ({
  onToggleSidebar,
  sidebarOpen,
  sidebarCollapsed,
  isMobile,
  logo,
  title,
  rightContent,
}) => {
  return (
    <header className={cn(
      "bg-white dark:bg-[hsl(var(--background-light-dark))] border-b border-gray-200 dark:border-gray-800 w-full"
    )}>
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[hsl(var(--background))] transition-colors text-gray-500 dark:text-gray-400 focus:outline-none"
            aria-label={isMobile ? (sidebarOpen ? "Close sidebar" : "Open sidebar") : (sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar")}
          >
            {isMobile ? (
              // On mobile: show menu icon regardless
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : sidebarCollapsed ? (
              // On desktop, collapsed: show menu icon to expand
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              // On desktop, expanded: show chevron to collapse
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2">
            {logo}
            <div className="text-xl font-bold text-primary dark:text-primary">
              {title}
            </div>
          </Link>
        </div>

        {/* Right Side Content */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="hidden md:block border-l border-gray-200 dark:border-gray-700 h-6 mx-2"></div>

          {/* Custom Right Content */}
          {rightContent}
        </div>
      </div>
    </header>
  );
};

export default BaseNavbar;
