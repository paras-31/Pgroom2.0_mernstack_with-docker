import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { UseFormRegister, Control, UseFormSetValue, Controller } from "react-hook-form";
import { User, Phone, MapPin, Mail, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { FormData } from "@/lib/schemas/auth";
import { useLocation, City } from "@/contexts/LocationContext";
import { toast } from "sonner";
import { USER_TYPES } from "@/lib/constants";

interface RegistrationFieldsProps {
  register: UseFormRegister<FormData>;
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  getErrorMessage: (field: string) => string | undefined;
  isFormDisabled: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
  showConfirmPassword?: boolean;
  setShowConfirmPassword?: (show: boolean) => void;
}

/**
 * Registration form fields component
 * Displays all fields needed for user registration
 */
const RegistrationFields = memo<RegistrationFieldsProps>(({
  register,
  control,
  setValue,
  getErrorMessage,
  isFormDisabled,
  showPassword = false,
  setShowPassword = () => {},
  showConfirmPassword = false,
  setShowConfirmPassword = () => {}
}) => {
  const { states, getCitiesByStateId } = useLocation();
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);

  // Memoize options to prevent unnecessary re-renders
  const stateOptions = useMemo(() => states.map(state => ({
    value: state.id,
    label: state.stateName
  })), [states]);

  // Memoize city options
  const cityOptions = useMemo(() => cities.map(city => ({
    value: city.id,
    label: city.cityName
  })), [cities]);

  // Check if there are no cities for the selected state
  const hasNoCities = useMemo(() =>
    cities.length === 1 && cities[0].id === 0,
    [cities]
  );

  // Handle city selection change with useCallback for better performance
  const handleCityChange = useCallback((value: string) => {
    // If the selected city has ID 0 ("No cities for this state"), set the city value to "0"
    if (value === "0") {
      setValue('city', '0');
    } else if (value) {
      // For any other valid city selection, set the value and trigger validation
      setValue('city', value, {
        shouldValidate: true, // This will trigger validation and clear the error
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [setValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      // Get cities for the selected state
      const citiesData = getCitiesByStateId(Number(selectedStateId));
      setCities(citiesData);

      // If there's only one city with ID 0 ("No cities for this state"), auto-select it
      if (citiesData.length === 1 && citiesData[0].id === 0) {
        setValue('city', '0', {
          shouldValidate: true, // Trigger validation to clear any errors
          shouldDirty: true,
          shouldTouch: true
        });
        // Show a toast notification instead of console.log
        toast.info("No cities available for the selected state");
      } else if (citiesData.length > 0) {
        // Reset city field but don't validate yet - user needs to select a city
        setValue('city', '', {
          shouldValidate: false
        });
      }
    } else {
      setCities([]);
    }
  }, [selectedStateId, getCitiesByStateId, setValue]);

  // Handle state change with useCallback for better performance
  const handleStateChange = useCallback((value: string) => {
    // Reset city field when state changes with validation
    setValue('city', '', {
      shouldValidate: false // Don't validate immediately as we're just clearing the field
    });

    // Update selected state ID
    setSelectedStateId(value);

    // Validate the state field to clear any errors
    if (value) {
      setValue('state', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [setValue, setSelectedStateId]);

  return (
  <div className="space-y-4 w-full">
    {/* Personal Information Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormInput
        icon={User}
        type="text"
        placeholder="First Name"
        register={register}
        control={control}
        name="firstName"
        error={getErrorMessage('firstName')}
        disabled={isFormDisabled}
      />
      <FormInput
        icon={User}
        type="text"
        placeholder="Last Name"
        register={register}
        control={control}
        name="lastName"
        error={getErrorMessage('lastName')}
        disabled={isFormDisabled}
      />
    </div>

    {/* Contact Information Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormInput
        icon={Mail}
        type="email"
        placeholder="Email Address"
        register={register}
        control={control}
        name="email"
        error={getErrorMessage('email')}
        disabled={isFormDisabled}
      />
      <FormInput
        icon={Phone}
        type="tel"
        placeholder="Mobile Number"
        register={register}
        control={control}
        name="mobileNo"
        error={getErrorMessage('mobileNo')}
        disabled={isFormDisabled}
      />
    </div>

    {/* Location Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormSelect
        icon={MapPin}
        placeholder="Select state"
        options={stateOptions}
        control={control}
        name="state"
        error={getErrorMessage('state')}
        disabled={isFormDisabled}
        onValueChange={handleStateChange}
      />
      <FormSelect
        icon={MapPin}
        placeholder={hasNoCities ? "No cities for this state" : "Select city"}
        options={cityOptions}
        control={control}
        name="city"
        error={getErrorMessage('city')}
        disabled={isFormDisabled || !selectedStateId || hasNoCities}
        onValueChange={handleCityChange}
      />
    </div>

    {/* Address - Full Width */}
    <FormInput
      icon={MapPin}
      type="text"
      placeholder="Address"
      register={register}
      control={control}
      name="address"
      error={getErrorMessage('address')}
      disabled={isFormDisabled}
      className="w-full"
    />

    {/* Password Fields - Both in the same row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <PasswordInput
        register={register}
        name="password"
        error={getErrorMessage('password')}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        disabled={isFormDisabled}
        placeholder="Password"
      />
      <PasswordInput
        register={register}
        name="confirmPassword"
        error={getErrorMessage('confirmPassword')}
        showPassword={showConfirmPassword}
        setShowPassword={setShowConfirmPassword}
        disabled={isFormDisabled}
        placeholder="Confirm Password"
      />
    </div>

    {/* User Type Selection */}
    <div className="space-y-2">
      <Label className="text-sm font-medium">I am a</Label>
      <Controller
        name="userType"
        control={control}
        render={({ field }) => {
          return (
            <RadioGroup
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
              }}
              className="flex gap-4"
              disabled={isFormDisabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={USER_TYPES.TENANT}
                  id="tenant"
                  disabled={isFormDisabled}
                />
                <Label htmlFor="tenant">Tenant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={USER_TYPES.OWNER}
                  id="owner"
                  disabled={isFormDisabled}
                />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          );
        }}
      />
      {getErrorMessage('userType') && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {getErrorMessage('userType')}
        </p>
      )}
    </div>
  </div>
  );
});

RegistrationFields.displayName = 'RegistrationFields';

export default RegistrationFields;
