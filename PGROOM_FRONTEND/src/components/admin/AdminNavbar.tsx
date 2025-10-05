import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
}

/**
 * AdminNavbar - Top navigation bar for the admin dashboard
 *
 * @param onToggleSidebar - Function to toggle the sidebar visibility
 * @param sidebarOpen - Whether the sidebar is currently open
 * @param isMobile - Whether the viewport is mobile size
 */
const AdminNavbar: React.FC<AdminNavbarProps> = ({
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
            className={cn(
              "p-2 rounded-md text-gray-500 dark:text-gray-400",
              "hover:text-gray-700 dark:hover:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors duration-200"
            )}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen && !isMobile ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo/Brand - Only show when sidebar is collapsed or on mobile */}
          {(sidebarCollapsed || isMobile) && (
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-primary hidden sm:block">
                Admin Panel
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <div className="hidden md:block border-l border-gray-200 dark:border-gray-700 h-6 mx-2"></div>

          <div className="flex items-center gap-2">
            <Link to="/admin/profile">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title="Admin Profile"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Admin</span>
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

export default AdminNavbar;
