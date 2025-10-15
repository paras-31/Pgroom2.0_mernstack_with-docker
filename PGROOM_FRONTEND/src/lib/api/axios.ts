import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from '@/components/ui/sonner';
import { getDecryptedToken, removeToken } from '@/lib/utils/crypto';
import { ApiResponse, ApiSuccessResponse, ApiValidationErrorResponse, ApiServerErrorResponse } from '@/lib/types/api';

// Define interface for API error responses
interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// Define base API URL - can be moved to environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://backend_con_pgrooms:8000';

// Create Axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get decrypted token from localStorage if it exists
    const token = getDecryptedToken();

    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response has the expected structure
    const data = response.data;

    // If the response has a statusCode property, it's following our API response format
    if (data && typeof data === 'object' && 'statusCode' in data) {
      const apiResponse = data as ApiResponse;

      // Handle different status codes
      switch (apiResponse.statusCode) {
        case 200:
          // Success response, just return it
          return response;

        case 422:
          // Validation error - let the component handle it
          // We don't show a toast here to avoid duplicate toasts
          // The component will handle showing the error message
          return Promise.reject(apiResponse);

        case 500:
          // Server error - show toast and reject
          toast.error(apiResponse.message || 'Server error. Please try again later');
          return Promise.reject(apiResponse);

        default: {
          // Unknown status code - show toast and reject
          // Don't show toaster for room assignment not found during implementation phase
          const message = (apiResponse as { message?: string }).message || 'An error occurred';
          if (!message.toLowerCase().includes('room assignment not found') && 
              !message.toLowerCase().includes('room assignment')) {
            toast.error(message);
          }
          return Promise.reject(apiResponse);
        }
      }
    }

    // If the response doesn't have the expected structure, just return it
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    // Check if the error response has our API response format
    if (response && response.data && typeof response.data === 'object' && 'statusCode' in response.data) {
      const apiResponse = response.data as ApiResponse;

      // Handle different status codes
      switch (apiResponse.statusCode) {
        case 422:
          // Validation error - let the component handle it
          return Promise.reject(apiResponse);

        case 500:
          // Server error - show toast and reject
          toast.error(apiResponse.message || 'Server error. Please try again later');
          return Promise.reject(apiResponse);

        default:
          // For other API response status codes, handle based on HTTP status
          break;
      }
    }

    // Handle HTTP status codes for non-API format responses
    if (response) {
      const status = response.status;
      const errorMessage = ((response.data as ApiErrorResponse)?.message);

      switch (status) {
        case 401:
          // Check if it's a wrong password error
          if (errorMessage === 'Wrong password') {
            // Let the component handle this specific error
            break;
          }
          // Other 401 errors - clear auth and redirect to unauthorized page
          removeToken();
          toast.error('Session expired. Please login again.');
          window.location.href = '/unauthorized';
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          // Don't show toaster for room assignment not found during implementation phase
          if (errorMessage && errorMessage.toLowerCase().includes('room assignment not found')) {
            // Skip toaster notification for room assignment errors
            break;
          }
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later');
          break;
        default: {
          // Get error message from response if available
          const errorMessage = ((response.data as ApiErrorResponse)?.message) || 'Something went wrong';
          // Don't show toaster for room assignment not found during implementation phase
          if (!errorMessage.toLowerCase().includes('room assignment not found') && 
              !errorMessage.toLowerCase().includes('room assignment')) {
            toast.error(errorMessage);
          }
        }
      }
    } else {
      // Network error or server not responding
      toast.error('Network error. Please check your connection');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
