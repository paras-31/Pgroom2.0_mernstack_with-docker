import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';

/**
 * User profile interface
 */
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobileNo?: string;
  address?: string;
  status: string;
  state?: {
    id: number;
    stateName: string;
  };
  city?: {
    id: number;
    cityName: string;
  };
  memberSince?: string;
}

/**
 * Update profile payload interface
 */
export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email?: string;
  mobileNo?: string;
  address?: string;
  stateId?: number;
  cityId?: number;
}

/**
 * User service for handling user-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiService.get<UserProfile>(endpoints.USER.PROFILE);
  },

  /**
   * Update current user profile
   * @param data - Profile update data
   */
  updateProfile: async (data: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
    return apiService.put<UserProfile>(endpoints.USER.UPDATE_PROFILE, data);
  },

  /**
   * Change user password
   * @param data - Password change data
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiService.put<void>(endpoints.USER.CHANGE_PASSWORD, data);
  }
};