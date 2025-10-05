import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

/**
 * Custom hook for form validation using Zod
 * Provides validation functions and error handling
 */
export const useFormValidation = <T extends Record<string, any>>(schema: ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate a single field
   * @param field - The field name
   * @param value - The field value
   * @returns True if valid, false otherwise
   */
  const validateField = useCallback(
    (field: keyof T, value: any): boolean => {
      try {
        // Create a partial schema with just this field
        const partialData = { [field]: value } as Partial<T>;
        schema.partial().parse(partialData);
        
        // Clear error for this field if validation passes
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          // Extract error message for this field
          const fieldError = error.errors.find(
            (err) => err.path[0] === field
          );
          
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [field as string]: fieldError.message,
            }));
          }
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Validate the entire form
   * @param data - The form data
   * @returns True if valid, false otherwise
   */
  const validateForm = useCallback(
    (data: T): boolean => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const newErrors: Record<string, string> = {};
          
          error.errors.forEach((err) => {
            if (err.path[0]) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          
          setErrors(newErrors);
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Get error message for a field
   * @param field - The field name
   * @returns The error message or undefined
   */
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field as string];
    },
    [errors]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    getFieldError,
    clearErrors,
  };
};

export default useFormValidation;
