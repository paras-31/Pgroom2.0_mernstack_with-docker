import { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

interface ApiOptions {
  requiresAuth?: boolean;
  showLoadingState?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  statusCode: number | null;
}

/**
 * Custom hook for making API calls
 * 
 * This hook provides a consistent way to make API calls with
 * automatic loading state, error handling, and authentication.
 */
export function useApi<T = any>(defaultOptions: ApiOptions = {}) {
  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
    statusCode: null,
  });
  
  const { setIsLoading, showErrorToast, showSuccessToast } = useApp();
  const { token } = useAuth();

  const fetchData = useCallback(
    async (
      url: string,
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
      body?: any,
      options: ApiOptions = {}
    ) => {
      // Merge default options with call-specific options
      const mergedOptions = { ...defaultOptions, ...options };
      const {
        requiresAuth = true,
        showLoadingState = true,
        showErrorToast: shouldShowErrorToast = true,
        showSuccessToast: shouldShowSuccessToast = false,
      } = mergedOptions;

      try {
        // Set loading state
        setResponse(prev => ({ ...prev, isLoading: true, error: null }));
        if (showLoadingState) {
          setIsLoading(true);
        }

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add auth token if required
        if (requiresAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Make the request
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        // Parse the response
        const data = await response.json();
        const statusCode = data.statusCode || response.status;

        // Handle different status codes
        if (statusCode === 200) {
          setResponse({
            data: data.data,
            error: null,
            isLoading: false,
            statusCode,
          });

          if (shouldShowSuccessToast && data.message) {
            showSuccessToast(data.message);
          }

          return { success: true, data: data.data, statusCode };
        } else {
          const errorMessage = data.message || 'Something went wrong';
          
          setResponse({
            data: null,
            error: errorMessage,
            isLoading: false,
            statusCode,
          });

          if (shouldShowErrorToast) {
            showErrorToast(errorMessage);
          }

          return { success: false, error: errorMessage, statusCode };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network error';
        
        setResponse({
          data: null,
          error: errorMessage,
          isLoading: false,
          statusCode: 500,
        });

        if (shouldShowErrorToast) {
          showErrorToast(errorMessage);
        }

        return { success: false, error: errorMessage, statusCode: 500 };
      } finally {
        if (showLoadingState) {
          setIsLoading(false);
        }
      }
    },
    [defaultOptions, setIsLoading, showErrorToast, showSuccessToast, token]
  );

  // Convenience methods for different HTTP methods
  const get = useCallback(
    (url: string, options?: ApiOptions) => fetchData(url, 'GET', undefined, options),
    [fetchData]
  );

  const post = useCallback(
    (url: string, body: any, options?: ApiOptions) => fetchData(url, 'POST', body, options),
    [fetchData]
  );

  const put = useCallback(
    (url: string, body: any, options?: ApiOptions) => fetchData(url, 'PUT', body, options),
    [fetchData]
  );

  const del = useCallback(
    (url: string, options?: ApiOptions) => fetchData(url, 'DELETE', undefined, options),
    [fetchData]
  );

  return {
    ...response,
    fetchData,
    get,
    post,
    put,
    delete: del,
  };
}

export default useApi;
