import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface TenantNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

/**
 * TenantNavbar - Top navigation bar for the tenant dashboard
 *
 * @param onToggleSidebar - Function to toggle the sidebar visibility
 * @param sidebarOpen - Whether the sidebar is currently open
 * @param isMobile - Whether the viewport is mobile size
 */
const TenantNavbar: React.FC<TenantNavbarProps> = ({
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
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isMobile ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
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
            <Link to="/tenant/profile">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>

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

export default TenantNavbar;
