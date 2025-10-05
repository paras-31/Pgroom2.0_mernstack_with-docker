import { useState, useCallback, useMemo } from "react";
import { useForm, FieldError, Control, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { USER_TYPES } from "@/lib/constants";
import { authService } from "@/lib/api/services";
import { ApiResponse, UserData, isApiSuccessResponse } from "@/lib/types/api";
import { loginSchema, registerSchema, type FormData, type LoginFormData, type RegisterFormData } from "@/lib/schemas/auth";
import { useAuth } from "./useAuth";
import { useApiResponse } from "./useApiResponse";

/**
 * Custom hook for authentication form handling
 * Manages form state, validation, and submission
 *
 * @param isLogin - Whether the form is in login mode (true) or register mode (false)
 */
export const useAuthForm = (isLogin: boolean) => {
  const { handleAuthSuccess, handleAuthError } = useAuth();
  const { handleSuccess, handleError } = useApiResponse();
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize default form values based on login mode
  const defaultFormValues = useMemo(() => {
    const baseValues = {
      email: "",
      password: ""
    };

    return isLogin ? baseValues : {
      ...baseValues,
      firstName: "",
      lastName: "",
      mobileNo: "",
      state: "",
      city: "",
      address: "",
      userType: USER_TYPES.TENANT,
      confirmPassword: ""
    };
  }, [isLogin]);

  // Form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    setError,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onTouched",
    defaultValues: defaultFormValues,
    criteriaMode: "firstError",
    delayError: 500,
  });

  // Helper function to safely access error messages
  const getErrorMessage = useCallback((fieldName: string): string | undefined => {
    return (errors as Record<string, FieldError>)?.[fieldName]?.message;
  }, [errors]);

  // Registration mutation
  const { mutate: submitRegistration, isPending: isRegistrationPending } = useMutation<
    ApiResponse<UserData>, // Explicitly define the expected response type
    Error | ApiResponse,
    RegisterFormData
  >({
    mutationFn: async (data: RegisterFormData): Promise<ApiResponse<UserData>> => {
      return await authService.register(data);
    },
    onSuccess: (response) => handleAuthSuccess(response, isLogin),
    onError: (error) => handleAuthError(error, setError)
  });

  // Handle form submission
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      if (isLogin) {
        // Handle login
        setIsProcessing(true);
        try {
          const response = await authService.login(data as LoginFormData);
          // Handle the API response
          handleAuthSuccess(response, isLogin);
        } catch (error) {
          // Handle errors
          handleAuthError(error, setError);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // For registration, use the mutation
        submitRegistration(data as RegisterFormData);
      }
    } catch (error) {
      // Handle any unexpected errors during form submission
      handleError(error, setError);
    }
  }, [isLogin, handleAuthSuccess, handleAuthError, handleError, setError, submitRegistration]);

  return {
    register,
    handleSubmit,
    control,
    setValue,
    isSubmitting,
    reset,
    setError,
    getErrorMessage,
    submitRegistration,
    isRegistrationPending,
    onSubmit,
    isProcessing
  };
};
