import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiResponse, UserData, isApiSuccessResponse, isApiValidationErrorResponse } from "@/lib/types/api";
import { storeEncryptedToken } from "@/lib/utils/crypto";
import { useApiResponse } from "./useApiResponse";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { tenantService } from "@/lib/api/services";

// Define a more specific type for axios errors
export type AxiosErrorType = {
  response?: {
    status: number;
    data?: {
      message?: string;
      statusCode?: number;
    };
  };
};

/**
 * Custom hook for authentication logic
 * Handles authentication success, errors, and redirection
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { handleError } = useApiResponse();
  const { updateAuthState } = useAuthContext();

  // Handle redirection based on user role
  const handleRedirectByRole = useCallback(async (roleId: number) => {
    const dashboards = {
      1: '/admin/dashboard',
      2: '/owner/dashboard',
      3: '/tenant/properties', // Default to properties for tenants
      default: '/'
    };

    // For tenants, check if they have a room assigned
    if (roleId === 3) {
      try {
        const roomResponse = await tenantService.getTenantRoomDetails();
        // If tenant has a room, redirect to dashboard
        if (roomResponse.statusCode === 200 && roomResponse.data) {
          navigate('/tenant/dashboard');
          return;
        }
      } catch (error) {
        // If error checking room status, still redirect to properties
        console.warn('Error checking tenant room status:', error);
      }
      // If no room or error, redirect to properties
      navigate('/tenant/properties');
      return;
    }

    // For other roles, use default redirection
    navigate(dashboards[roleId] || dashboards.default);
  }, [navigate]);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((response: ApiResponse<UserData>, isLogin: boolean) => {
    // Check if the response is a success response
    if (isApiSuccessResponse(response)) {
      // Show success message
      toast.success(
        isLogin
          ? "Login successful!"
          : "Registration successful! Please login with your credentials."
      );

      // Extract user data from response
      const userData = response.data;

      // Store encrypted token in localStorage if it exists
      if (userData.token) {
        storeEncryptedToken(userData.token);

        // Update auth context state
        updateAuthState(userData.token, userData.roleId);

        // For login, redirect based on role
        if (isLogin && userData.roleId) {
          handleRedirectByRole(userData.roleId);
        }
      }

      // For registration, redirect to login page
      if (!isLogin) {
        // Short delay to allow the user to see the success message
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } else if (isApiValidationErrorResponse(response)) {
      // Handle validation error
      toast.error(response.message || "Validation error");
    } else {
      // Handle other errors
      toast.error(response.message || "An error occurred");
    }
  }, [handleRedirectByRole, navigate, updateAuthState]);

  // Handle authentication errors
  const handleAuthError = useCallback((error: Error | unknown, setError?: (name: string, error: { message: string }) => void) => {
    // Check if it's an API response error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ApiResponse;

      // Handle specific validation errors
      if (isApiValidationErrorResponse(apiError)) {
        // Handle specific error cases for form validation
        if (apiError.message === "Wrong password" && setError) {
          toast.error("Incorrect password. Please try again.");
          setError("password", { message: "Incorrect password" });
        } else if (apiError.message?.includes("Email already exist") && setError) {
          toast.error("Email already exists. Please use a different email.");
          setError("email", { message: "Email already exists" });
        } else if (apiError.message?.includes("Mobile Number must be exactly 10 digits") && setError) {
          toast.error("Mobile number must be exactly 10 digits.");
          setError("mobileNo", { message: "Mobile number must be exactly 10 digits" });
        } else {
          // Generic validation error
          toast.error(apiError.message || "Validation error");
          if (setError) {
            setError("form", { message: apiError.message || "Validation error" });
          }
        }
      } else {
        // Use the generic error handler for other API errors
        handleError(error, setError);
      }
    } else {
      // Handle non-API errors (like network errors)
      const axiosError = error as AxiosErrorType;
      const errorMessage = axiosError.response?.data?.message;

      if (axiosError.response?.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error(
          errorMessage ||
          (error instanceof Error ? error.message : "An error occurred. Please try again.")
        );
      }
    }
  }, [handleError]);

  return { handleRedirectByRole, handleAuthSuccess, handleAuthError };
};
