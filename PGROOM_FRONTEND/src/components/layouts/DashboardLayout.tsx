import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import useSidebar from '@/hooks/useSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  navbar: ReactNode;
  sidebar: ReactNode;
  defaultCollapsed?: boolean;
}

/**
 * DashboardLayout - A reusable layout component for dashboard pages
 *
 * This component handles the responsive behavior of the dashboard layout,
 * including sidebar toggling and mobile responsiveness.
 *
 * @param children - The main content to display
 * @param navbar - The navbar component
 * @param sidebar - The sidebar component
 * @param defaultCollapsed - Whether the sidebar should be collapsed by default on desktop
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navbar,
  sidebar,
  defaultCollapsed = false,
}) => {
  // Use the custom sidebar hook for state management
  const {
    sidebarOpen,
    sidebarCollapsed,
    isMobile,
    toggleSidebar
  } = useSidebar({ defaultCollapsed });

  // Clone navbar and sidebar with necessary props
  const navbarWithProps = React.cloneElement(navbar as React.ReactElement, {
    onToggleSidebar: toggleSidebar,
    sidebarOpen,
    sidebarCollapsed,
    isMobile,
  });

  const sidebarWithProps = React.cloneElement(sidebar as React.ReactElement, {
    collapsed: sidebarCollapsed,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] flex flex-col">
      {/* Navbar - fixed at the top */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-sm">
        {navbarWithProps}
      </div>

      {/* Main container - with proper top padding to account for fixed navbar */}
      <div className="flex flex-1 pt-16 relative">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 bottom-0 left-0 z-40 transform",
            "bg-white dark:bg-[hsl(var(--background-light-dark))]",
            "border-r border-gray-200 dark:border-gray-800",
            "transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-16" : "w-64",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Sidebar"
        >
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {sidebarWithProps}
          </div>
        </aside>

        {/* Main content - adjusts width based on sidebar state */}
        <main
          className={cn(
            "flex-1 p-2 md:p-4 lg:p-5",
            "transition-all duration-300 ease-in-out",
            sidebarOpen && !isMobile ? (sidebarCollapsed ? "lg:ml-16" : "lg:ml-64") : "ml-0"
          )}
          id="main-content"
        >
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
