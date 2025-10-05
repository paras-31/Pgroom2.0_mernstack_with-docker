import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { UseFormRegister, Control, UseFormSetValue } from "react-hook-form";
import { User, Phone, MapPin, Mail, Lock } from "lucide-react";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { FormData } from "@/lib/schemas/auth";
import { useLocation, City } from "@/contexts/LocationContext";
import { toast } from "sonner";

interface TenantRegistrationFieldsProps {
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
 * TenantRegistrationFields - Modified registration fields for tenant invitation
 * Removes the user type selection and sets default to tenant
 */
const TenantRegistrationFields = memo<TenantRegistrationFieldsProps>(({
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
  const { states, getCitiesByStateId, loadCities } = useLocation();
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Component mount logging
  useEffect(() => {
    console.log('TenantRegistrationFields mounted');
  }, []);

  // Log when states change
  useEffect(() => {
    console.log('States updated:', states);
  }, [states]);

  // Set userType to tenant by default
  useEffect(() => {
    setValue('userType', 'tenant', { shouldValidate: true });
  }, [setValue]);

  // Memoize options to prevent unnecessary re-renders
  const stateOptions = useMemo(() => {
    console.log('States from LocationContext:', states);
    return states.map(state => ({
      value: state.id,
      label: state.stateName
    }));
  }, [states]);

  // Memoize city options
  const cityOptions = useMemo(() => {
    console.log('Cities for state:', selectedStateId, cities);
    return cities.map(city => ({
      value: city.id,
      label: city.cityName
    }));
  }, [cities, selectedStateId]);

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

  // Load cities for a state
  const loadCitiesForState = useCallback(async (stateId: number) => {
    if (!stateId) return;

    console.log('Loading cities for state ID:', stateId);
    setIsLoadingCities(true);

    try {
      // Always load fresh cities to ensure we have the latest data
      const citiesData = await loadCities(stateId);
      console.log('Loaded cities:', citiesData);

      setCities(citiesData);

      // If there are no cities, show a toast
      if (citiesData.length === 1 && citiesData[0].id === 0) {
        toast.info('No cities available for the selected state');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, [loadCities]);

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

      // Load cities for the selected state
      loadCitiesForState(Number(value));
    }
  }, [setValue, setSelectedStateId, loadCitiesForState]);

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
        placeholder={isLoadingCities ? "Loading cities..." : hasNoCities ? "No cities for this state" : "Select city"}
        options={cityOptions}
        control={control}
        name="city"
        error={getErrorMessage('city')}
        disabled={isFormDisabled || !selectedStateId || hasNoCities || isLoadingCities}
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
  </div>
  );
});

TenantRegistrationFields.displayName = 'TenantRegistrationFields';

export default TenantRegistrationFields;
