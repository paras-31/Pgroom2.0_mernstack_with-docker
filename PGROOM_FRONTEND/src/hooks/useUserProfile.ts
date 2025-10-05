import { useState, useEffect } from 'react';
import { userService, UserProfile, UpdateProfilePayload } from '@/lib/api/services/userService';
import { toast } from 'sonner';
import { useApiResponse } from './useApiResponse';

/**
 * Custom hook for managing user profile
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { handleError } = useApiResponse();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getProfile();
      
      if (response.statusCode === 200 && response.data) {
        setProfile(response.data);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfilePayload): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const response = await userService.updateProfile(data);
      
      if (response.statusCode === 200 && response.data) {
        setProfile(response.data);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error('Failed to update profile');
        return false;
      }
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const response = await userService.changePassword(data);
      
      if (response.statusCode === 200) {
        toast.success('Password changed successfully');
        return true;
      } else {
        toast.error('Failed to change password');
        return false;
      }
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    isUpdating,
    fetchProfile,
    updateProfile,
    changePassword
  };
};