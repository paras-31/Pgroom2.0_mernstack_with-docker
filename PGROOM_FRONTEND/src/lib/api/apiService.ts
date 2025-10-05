import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosInstance from './axios';
import { ApiResponse, isApiSuccessResponse, isApiValidationErrorResponse } from '@/lib/types/api';
import { toast } from 'sonner';

/**
 * Maximum number of retries for network errors
 */
const MAX_RETRIES = 2;

/**
 * Delay between retries in milliseconds (exponential backoff)
 */
const getRetryDelay = (retryCount: number) => Math.pow(2, retryCount) * 1000;

/**
 * Generic API service with typed request and response
 * Includes retry logic for network errors and improved error handling
 */
export const apiService = {
  /**
   * GET request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with API response
   */
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    let retries = 0;

    while (true) {
      try {
        const response: AxiosResponse = await axiosInstance.get(url, config);
        return response.data as ApiResponse<T>;
      } catch (error) {
        // Only retry on network errors, not server errors
        if (axios.isAxiosError(error) && !error.response && retries < MAX_RETRIES) {
          retries++;
          const delay = getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Handle and rethrow other errors
          handleApiError(error, url);
          throw error;
        }
      }
    }
  },

  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with API response
   */
  post: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    let retries = 0;

    while (true) {
      try {
        const response: AxiosResponse = await axiosInstance.post(url, data, config);
        return response.data as ApiResponse<T>;
      } catch (error) {
        // Only retry on network errors, not server errors
        if (axios.isAxiosError(error) && !error.response && retries < MAX_RETRIES) {
          retries++;
          const delay = getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Handle and rethrow other errors
          handleApiError(error, url);
          throw error;
        }
      }
    }
  },

  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with API response
   */
  put: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    let retries = 0;

    while (true) {
      try {
        const response: AxiosResponse = await axiosInstance.put(url, data, config);
        return response.data as ApiResponse<T>;
      } catch (error) {
        // Only retry on network errors, not server errors
        if (axios.isAxiosError(error) && !error.response && retries < MAX_RETRIES) {
          retries++;
          const delay = getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Handle and rethrow other errors
          handleApiError(error, url);
          throw error;
        }
      }
    }
  },

  /**
   * PATCH request
   * @param url - API endpoint
   * @param data - Request payload
   * @param config - Axios request config
   * @returns Promise with API response
   */
  patch: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    let retries = 0;

    while (true) {
      try {
        const response: AxiosResponse = await axiosInstance.patch(url, data, config);
        return response.data as ApiResponse<T>;
      } catch (error) {
        // Only retry on network errors, not server errors
        if (axios.isAxiosError(error) && !error.response && retries < MAX_RETRIES) {
          retries++;
          const delay = getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Handle and rethrow other errors
          handleApiError(error, url);
          throw error;
        }
      }
    }
  },

  /**
   * DELETE request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with API response
   */
  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    let retries = 0;

    while (true) {
      try {
        const response: AxiosResponse = await axiosInstance.delete(url, config);
        return response.data as ApiResponse<T>;
      } catch (error) {
        // Only retry on network errors, not server errors
        if (axios.isAxiosError(error) && !error.response && retries < MAX_RETRIES) {
          retries++;
          const delay = getRetryDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Handle and rethrow other errors
          handleApiError(error, url);
          throw error;
        }
      }
    }
  },

  /**
   * Extract data from API success response
   * @param response - API response
   * @returns Data from the response
   * @throws Error if the response is not a success response
   */
  extractData: <T>(response: ApiResponse<T>): T => {
    if (isApiSuccessResponse(response)) {
      return response.data;
    }

    // Check if this is a room assignment related error - skip toaster for these
    const isRoomAssignmentError = (message: string) => {
      const lowerMessage = message.toLowerCase();
      return lowerMessage.includes('room assignment not found') || 
             lowerMessage.includes('room assignment');
    };

    const errorMessage = response.message || '';

    // Handle validation errors
    if (isApiValidationErrorResponse(response)) {
      if (!isRoomAssignmentError(errorMessage)) {
        toast.error(response.message || 'Validation error');
      }
    } else {
      if (!isRoomAssignmentError(errorMessage)) {
        toast.error(response.message || 'Server error');
      }
    }

    throw new Error(response.message || 'Error processing response');
  }
};

/**
 * Helper function to handle API errors
 * @param error - The error object
 * @param url - The API endpoint URL
 */
const handleApiError = (error: unknown, url: string) => {
  // Check if this is a room assignment related error - skip toaster for these
  const isRoomAssignmentError = (message: string) => {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('room assignment not found') || 
           lowerMessage.includes('room assignment') ||
           (url.includes('/tenant/room-details') && lowerMessage.includes('not found'));
  };

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Handle different error scenarios
    if (!axiosError.response) {
      // Network error
      if (url.includes('/tenant/room-details')) {
        console.log('Suppressing network error toaster for room details endpoint');
        return;
      }
      if (!isRoomAssignmentError(axiosError.message)) {
        toast.error('Network error. Please check your connection.');
      }
    } else if (axiosError.response.status === 401) {
      // Unauthorized - handled by axios interceptor
    } else if (axiosError.response.status === 404) {
      // Special handling for room details endpoint - don't show toaster for any 404s
      if (url.includes('/tenant/room-details')) {
        console.log('Suppressing 404 error toaster for room details endpoint');
        return;
      }
      // Don't show toaster for room assignment not found during implementation phase
      const errorData = axiosError.response.data as { message?: string };
      const errorMessage = errorData?.message || 'Resource not found';
      if (!isRoomAssignmentError(errorMessage)) {
        toast.error(`Resource not found: ${url}`);
      }
    } else if (axiosError.response.status >= 500) {
      // Special handling for room details endpoint - don't show toaster for any 500s
      if (url.includes('/tenant/room-details')) {
        console.log('Suppressing server error toaster for room details endpoint');
        return;
      }
      const errorData = axiosError.response.data as { message?: string };
      const errorMessage = errorData?.message || 'Server error';
      if (!isRoomAssignmentError(errorMessage)) {
        toast.error('Server error. Please try again later.');
      }
    }
  } else {
    // Unknown error
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    // Special handling for room details endpoint - don't show toaster for any errors
    if (url.includes('/tenant/room-details')) {
      return;
    }
    
    // Don't show toaster for room assignment not found during implementation phase
    if (!isRoomAssignmentError(errorMessage)) {
      toast.error(errorMessage);
    }
  }
};
