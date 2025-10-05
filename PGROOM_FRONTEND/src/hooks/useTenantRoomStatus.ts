import { useState, useEffect } from 'react';
import { tenantService } from '@/lib/api/services';
import { isApiSuccessResponse } from '@/lib/types/api';

/**
 * Custom hook to manage tenant room assignment status
 * and determine navigation options
 */
export const useTenantRoomStatus = () => {
  const [hasRoom, setHasRoom] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRoomStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await tenantService.getTenantRoomDetails();
        
        if (isApiSuccessResponse(response)) {
          // If we get room details successfully, tenant has a room
          setHasRoom(true);
        } else {
          // If API returns error or no room found, tenant doesn't have a room
          setHasRoom(false);
        }
      } catch (err) {
        // If API call fails (404, etc.), assume no room assigned
        setHasRoom(false);
        setError(err instanceof Error ? err.message : 'Failed to check room status');
      } finally {
        setIsLoading(false);
      }
    };

    checkRoomStatus();
  }, []);

  return {
    hasRoom,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-run the effect by resetting state
      setHasRoom(null);
    }
  };
};