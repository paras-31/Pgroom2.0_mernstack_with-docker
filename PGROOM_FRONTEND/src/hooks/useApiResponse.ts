import { useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { 
  ApiResponse, 
  isApiSuccessResponse, 
  isApiValidationErrorResponse, 
  isApiServerErrorResponse 
} from '@/lib/types/api';

/**
 * Custom hook for handling API responses
 * Provides utility functions for handling success, validation errors, and server errors
 */
export const useApiResponse = () => {
  /**
   * Handle API success response
   * @param response - The API response
   * @param successMessage - Optional custom success message
   * @returns The data from the response
   */
  const handleSuccess = useCallback(<T>(
    response: ApiResponse<T>, 
    successMessage?: string
  ): T => {
    if (isApiSuccessResponse(response)) {
      // Show success toast if a message is provided
      if (successMessage) {
        toast.success(successMessage);
      }
      return response.data;
    }
    
    // If not a success response, handle as error
    if (isApiValidationErrorResponse(response)) {
      toast.error(response.message || 'Validation error');
    } else if (isApiServerErrorResponse(response)) {
      toast.error(response.message || 'Server error');
    } else {
      toast.error('Unknown error occurred');
    }
    
    // Throw error to be caught by the caller
    throw new Error(response.message || 'Error processing response');
  }, []);

  /**
   * Handle API error response
   * @param error - The error object
   * @param setFormError - Optional function to set form field errors
   */
  const handleError = useCallback((
    error: unknown, 
    setFormError?: (field: string, message: { message: string }) => void
  ) => {
    // Check if the error is an API response
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ApiResponse;
      
      if (isApiValidationErrorResponse(apiError)) {
        // Handle validation error
        toast.error(apiError.message || 'Validation error');
        
        // If we have a form error setter, try to set field-specific errors
        if (setFormError && apiError.message) {
          // Handle common validation errors
          if (apiError.message.includes('Email already exist')) {
            setFormError('email', { message: 'Email already exists' });
          } else if (apiError.message.includes('Mobile Number must be exactly 10 digits')) {
            setFormError('mobileNo', { message: 'Mobile number must be exactly 10 digits' });
          } else {
            // Set generic form error
            setFormError('form', { message: apiError.message });
          }
        }
      } else if (isApiServerErrorResponse(apiError)) {
        // Handle server error
        toast.error(apiError.message || 'Server error. Please try again later');
      } else {
        // Handle unknown API error
        toast.error(apiError.message || 'An error occurred');
      }
    } else if (error instanceof Error) {
      // Handle standard JS Error
      toast.error(error.message || 'An error occurred');
    } else {
      // Handle unknown error
      toast.error('An unknown error occurred');
    }
  }, []);

  return {
    handleSuccess,
    handleError
  };
};
