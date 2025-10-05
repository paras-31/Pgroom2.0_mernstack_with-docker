import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface OwnerNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

/**
 * OwnerNavbar - Top navigation bar for the owner dashboard
 *
 * @param onToggleSidebar - Function to toggle the sidebar visibility
 * @param sidebarOpen - Whether the sidebar is currently open
 * @param isMobile - Whether the viewport is mobile size
 */
const OwnerNavbar: React.FC<OwnerNavbarProps> = ({
  onToggleSidebar,
  sidebarOpen,
  sidebarCollapsed,
  isMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={cn(
      "bg-white dark:bg-[hsl(var(--background-light-dark))] border-b border-gray-200 dark:border-gray-800 w-full"
    )}>
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
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

          <Link to="/" className="flex items-center gap-2">
            <div className="text-xl font-bold text-primary dark:text-primary">
              PropertyHub
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <div className="hidden md:block border-l border-gray-200 dark:border-gray-700 h-6 mx-2"></div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default OwnerNavbar;
