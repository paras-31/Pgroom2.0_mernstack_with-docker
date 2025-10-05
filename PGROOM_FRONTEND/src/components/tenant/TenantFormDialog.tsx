import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';

// Form components
import TenantRegistrationFields from '@/components/tenant/TenantRegistrationFields';

// API and types
import { authService } from '@/lib/api/services';
import { RegisterFormData } from '@/lib/schemas/auth';
import { registerSchema } from '@/lib/schemas/auth';
import { USER_TYPES } from '@/lib/constants';
import { useApiResponse } from '@/hooks/useApiResponse';

interface TenantFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * TenantFormDialog - Dialog for adding a new tenant
 * Reuses the registration form with an additional status parameter
 */
const TenantFormDialog: React.FC<TenantFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleError } = useApiResponse();

  // The LocationContext is used by RegistrationFields component

  // Form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    control,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      state: "",
      city: "",
      address: "",
      userType: USER_TYPES.TENANT,
      password: "",
      confirmPassword: ""
    },
    criteriaMode: "firstError",
    delayError: 500,
  });

  // Helper function to safely access error messages
  const getErrorMessage = (fieldName: string): string | undefined => {
    return (errors as Record<string, any>)?.[fieldName]?.message;
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, reset]);

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);

      // Transform the form data to match the API requirements
      // This is similar to the register function in authService but adds status="Invited"
      const apiPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNo: data.mobileNo,
        state: Number(data.state),
        city: Number(data.city),
        isAdmin: data.userType === 'owner', // owner = true, tenant = false
        password: data.password,
        confirmPassword: data.confirmPassword,
        address: data.address,
        status: "Invited" // Add the status parameter
      };

      // Call the register API
      const response = await authService.register(apiPayload);

      if (response && response.statusCode === 200) {
        toast.success('Tenant invited successfully');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Failed to invite tenant');
      }
    } catch (error) {
      handleError(error, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <DialogTitle className="text-xl font-bold text-white mb-1">
              Add New Tenant
            </DialogTitle>
            <DialogDescription className="text-green-100 opacity-90">
              Fill in the details to invite a new tenant to your property
            </DialogDescription>

            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">
                  New Tenant
                </div>
                <div className="text-xs text-green-100">
                  Will be invited to join your property
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <TenantRegistrationFields
              register={register}
              control={control}
              setValue={setValue}
              getErrorMessage={getErrorMessage}
              isFormDisabled={isSubmitting}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Tenant
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantFormDialog;
