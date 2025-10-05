import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// API and types
import { authService } from '@/lib/api/services';
import { RegisterFormData } from '@/lib/schemas/auth';
import { registerSchema } from '@/lib/schemas/auth';
import { useApiResponse } from '@/hooks/useApiResponse';
import { useLocation } from '@/contexts/LocationContext';

interface OwnerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * OwnerFormDialog - Dialog for adding a new owner
 * Similar to TenantFormDialog but creates an owner account
 */
const OwnerFormDialog: React.FC<OwnerFormDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleError } = useApiResponse();

  // Location context for states and cities
  const { states, cities, loadCities } = useLocation();
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [stateCities, setStateCities] = useState<Array<{ id: number; cityName: string }>>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Form handling with react-hook-form
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      password: '',
      confirmPassword: '',
      state: '',
      city: '',
      address: '',
      userType: 'owner'
    }
  });

  // Handle state change
  const handleStateChange = async (value: string) => {
    const stateId = Number(value);
    setSelectedStateId(stateId);
    form.setValue('state', value);
    form.setValue('city', ''); // Reset city when state changes

    if (stateId) {
      setIsLoadingCities(true);
      const cities = await loadCities(stateId);
      setStateCities(cities);
      setIsLoadingCities(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);

      // Prepare the payload for owner registration (admin role)
      const payload = {
        ...data,
        status: 'Active'
      };

      const response = await authService.register(payload);

      if (response.statusCode === 200) {
        toast.success('Owner created successfully');
        form.reset();
        setSelectedStateId(null);
        setStateCities([]);
        onClose();
        onSuccess?.();
      } else {
        handleError(response);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedStateId(null);
      setStateCities([]);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New Owner
        </DialogTitle>
        <DialogDescription>
          Create a new owner account. The owner will receive login credentials via email.
        </DialogDescription>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                placeholder="Enter first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                placeholder="Enter last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile Number *</Label>
              <Input
                id="mobileNo"
                {...form.register('mobileNo')}
                placeholder="Enter mobile number"
              />
              {form.formState.errors.mobileNo && (
                <p className="text-sm text-red-500">{form.formState.errors.mobileNo.message}</p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select onValueChange={handleStateChange} value={form.watch('state')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.state && (
                <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select 
                onValueChange={(value) => form.setValue('city', value)} 
                value={form.watch('city')}
                disabled={!selectedStateId || isLoadingCities}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingCities ? "Loading cities..." : 
                    !selectedStateId ? "Select state first" : "Select city"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {stateCities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.city && (
                <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="Enter full address"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          {/* Password Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...form.register('confirmPassword')}
                  placeholder="Confirm password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Owner
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerFormDialog;
