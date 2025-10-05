import { useState, useEffect, useCallback } from 'react';

// Constants for localStorage keys
const SIDEBAR_OPEN_KEY = 'sidebar:open';
const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed';

interface UseSidebarOptions {
  defaultCollapsed?: boolean;
  mobileBreakpoint?: number;
}

/**
 * Custom hook for managing sidebar state
 *
 * This hook handles the responsive behavior of the sidebar,
 * including open/closed state and collapsed/expanded state.
 * The state is persisted in localStorage to maintain consistency
 * across page navigations.
 *
 * @param options - Configuration options
 * @returns Sidebar state and control functions
 */
export function useSidebar({
  defaultCollapsed = false,
  mobileBreakpoint = 1024
}: UseSidebarOptions = {}) {
  // Initialize state from localStorage or use defaults
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedOpen = localStorage.getItem(SIDEBAR_OPEN_KEY);
    return savedOpen !== null ? savedOpen === 'true' : true;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return savedCollapsed !== null ? savedCollapsed === 'true' : defaultCollapsed;
  });

  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobileView);

      // Auto-close sidebar on mobile, maintain state on desktop
      if (isMobileView) {
        // On mobile, we close the sidebar but don't update localStorage
        // This way when returning to desktop, the previous state is restored
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        // On desktop, restore the saved state from localStorage
        const savedOpen = localStorage.getItem(SIDEBAR_OPEN_KEY);
        if (savedOpen !== null) {
          setSidebarOpen(savedOpen === 'true');
        } else {
          setSidebarOpen(true);
        }
        // Keep the current collapsed state on desktop resize
      }
    };

    // Initial check
    checkMobile();

    // Add event listener with debounce for better performance
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [mobileBreakpoint]);

  // Persist sidebar open state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  // Persist sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Custom setter for sidebarOpen that also updates localStorage
  const setSidebarOpenWithStorage = useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
    setSidebarOpen(value);
  }, []);

  // Custom setter for sidebarCollapsed that also updates localStorage
  const setSidebarCollapsedWithStorage = useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
    setSidebarCollapsed(value);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      // On mobile: toggle between fully open and fully closed
      setSidebarOpen(!sidebarOpen);
      setSidebarCollapsed(false);
    } else {
      // On desktop: toggle between expanded and collapsed (icons only)
      setSidebarCollapsed(!sidebarCollapsed);
      setSidebarOpen(true);
    }
  }, [isMobile, sidebarOpen, sidebarCollapsed]);

  return {
    sidebarOpen,
    sidebarCollapsed,
    isMobile,
    toggleSidebar,
    setSidebarOpen: setSidebarOpenWithStorage,
    setSidebarCollapsed: setSidebarCollapsedWithStorage
  };
}

export default useSidebar;
