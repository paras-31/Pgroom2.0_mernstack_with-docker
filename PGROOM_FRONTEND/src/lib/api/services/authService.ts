import { apiService } from '../apiService';
import { endpoints } from '../index';
import { LoginFormData, RegisterFormData } from '@/lib/schemas/auth';
import { ApiResponse, UserData } from '@/lib/types/api';
import { ExtendedRegisterFormData } from '@/lib/types/auth';
import { removeToken } from '@/lib/utils/crypto';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user
   * @param data - Login form data
   * @returns Promise with login response
   */
  login: async (data: LoginFormData): Promise<ApiResponse<UserData>> => {
    return apiService.post<UserData>(endpoints.AUTH.LOGIN, data);
  },

  /**
   * Get user role from response
   * @param userData - User data from login response
   * @returns Role ID (1: Admin, 2: Owner, 3: Tenant)
   */
  getUserRole: (userData: UserData): number => {
    return userData.roleId;
  },

  /**
   * Register user
   * @param data - Registration form data with optional status
   * @returns Promise with registration response
   */
  register: async (data: RegisterFormData | ExtendedRegisterFormData): Promise<ApiResponse<UserData>> => {
    // Transform the form data to match the API requirements
    const apiPayload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNo: data.mobileNo,
      state: Number(data.state),
      city: Number(data.city),
      isAdmin: data.userType === 'owner', // owner = true, tenant = false
      password: data.password,
      confirmPassword: data.confirmPassword,
      address: data.address
    };

    // Add status if it exists in the data (for tenant invitation)
    if ('status' in data && data.status) {
      apiPayload.status = data.status;
    }

    // Debug logging to verify the payload
    console.log('Registration Form Data:', data);
    console.log('API Payload being sent:', apiPayload);
    console.log('userType from form:', data.userType);
    console.log('isAdmin calculated:', data.userType === 'owner');

    return apiService.post<UserData>(endpoints.AUTH.REGISTER, apiPayload);
  },

  /**
   * Logout user
   * @returns Promise with logout response
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiService.post<void>(endpoints.AUTH.LOGOUT);
    // Clear encrypted auth token on logout
    removeToken();
    return response;
  },

  /**
   * Refresh authentication token
   * @returns Promise with new token
   */
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiService.post<{ token: string }>(endpoints.AUTH.REFRESH_TOKEN);
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise with response
   */
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(endpoints.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   * @param token - Reset token
   * @param password - New password
   * @returns Promise with response
   */
  resetPassword: async (token: string, password: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(endpoints.AUTH.RESET_PASSWORD, { token, password });
  },
};
