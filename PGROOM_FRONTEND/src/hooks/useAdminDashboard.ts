import { useState } from 'react';

/**
 * Simple admin dashboard hook - clean slate
 */
export const useAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    // Empty hook ready for new functionality
  };
};

export default useAdminDashboard;
