import React, { useEffect, useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PropertyFormValues } from '../MultiStepPropertyForm';
import { useLocation, City } from '@/contexts/LocationContext';
import { MapPin, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import AddressSearch from '../AddressSearch';
// Removed pincode import
import { Card, CardContent } from '@/components/ui/card';

interface PropertyLocationStepProps {
  form: UseFormReturn<PropertyFormValues>;
  isSubmitting: boolean;
  addressSearchValue: string;
  isAddressSelected: boolean;
  handleAddressSearchChange: (value: string, addressData?: any) => void;
  handleAddressSelect: (addressData: any) => void;
}

/**
 * PropertyLocationStep - Second step of the property form for location information
 */
const PropertyLocationStep: React.FC<PropertyLocationStepProps> = ({
  form,
  isSubmitting,
  addressSearchValue,
  isAddressSelected,
  handleAddressSearchChange,
  handleAddressSelect
}) => {
  const { states, cities, loadCities, getCitiesByStateId } = useLocation();
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Watch the state field to load cities when it changes
  const watchedState = form.watch('state');

  // Function to load cities for a state - memoized with useCallback
  const loadCitiesForState = useCallback(async (stateId: number) => {
    // Check if stateId is a valid number
    if (!stateId || isNaN(stateId)) {
      setStateCities([]);
      setIsLoadingCities(false);
      return;
    }

    setIsLoadingCities(true);

    try {
      // First check if we already have the cities for this state
      const existingCities = getCitiesByStateId(stateId);

      if (existingCities.length > 0) {
        setStateCities(existingCities);

        // If there are no cities (only the placeholder), show a toast
        if (existingCities.length === 1 && existingCities[0].id === 0) {
          toast.info('No cities available for the selected state');
        }
      } else {
        // If not, load them
        const cityData = await loadCities(stateId);
        setStateCities(cityData);

        // If there are no cities, show a toast
        if (cityData.length === 1 && cityData[0].id === 0) {
          toast.info('No cities available for the selected state');
        }
      }
    } catch (error) {
      toast.error('Failed to load cities');
    } finally {
      setIsLoadingCities(false);
    }

    // Return a resolved promise to allow chaining
    return Promise.resolve();
  }, [getCitiesByStateId, loadCities]);

  // Load cities when component mounts if we have a state value (for edit mode)
  useEffect(() => {
    const initialState = form.getValues('state');

    if (initialState) {
      // Check if initialState is a valid number
      const stateId = Number(initialState);

      if (!isNaN(stateId)) {
        // Load cities for this state
        loadCitiesForState(stateId).then(() => {
          // After cities are loaded, try to set the city value if we have a property with city
          const formValues = form.getValues();
          const cityValue = formValues.city;

          // If city is a string name, find its ID
          if (cityValue && typeof cityValue === 'string' && isNaN(Number(cityValue))) {
            // Find city by name in the loaded cities
            const cityObj = stateCities.find(c =>
              c.cityName.toLowerCase() === cityValue.toLowerCase()
            );

            if (cityObj) {
              form.setValue('city', String(cityObj.id), { shouldValidate: true });
            }
          }
        });
      }
    }
  }, [form, loadCitiesForState, stateCities]);

  // Watch for state changes and load cities accordingly
  useEffect(() => {
    if (watchedState) {
      const stateId = Number(watchedState);

      if (!isNaN(stateId)) {
        loadCitiesForState(stateId).then(() => {
          // After cities are loaded, check if we need to update the city value
          const cityValue = form.getValues('city');

          // If city is a string name, try to find its ID in the loaded cities
          if (cityValue && typeof cityValue === 'string' && isNaN(Number(cityValue))) {
            const cityObj = stateCities.find(c =>
              c.cityName.toLowerCase() === cityValue.toLowerCase()
            );

            if (cityObj) {
              form.setValue('city', String(cityObj.id), { shouldValidate: true });
            }
          }
        });
      }
    } else {
      setStateCities([]);
    }
  }, [watchedState, loadCitiesForState, form, stateCities]);

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-3 text-muted-foreground mb-6">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          Provide the location details of your property. You can search for your address using the search box, which will automatically fill in the state and city fields.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Property Address with Google Places */}
          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <AddressSearch
                    value={addressSearchValue || field.value}
                    onChange={handleAddressSearchChange}
                    onAddressSelect={handleAddressSelect}
                    placeholder="Search for your property address"
                    states={states}
                    cities={cities}
                    error={form.formState.errors.propertyAddress?.message}
                    readOnly={isAddressSelected}
                  />
                </FormControl>
                <FormDescription>
                  {isAddressSelected
                    ? "Address selected. Click the X to clear and search again."
                    : "Search for your address to automatically fill location details"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State and City - Two columns on desktop, single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* State */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state.id} value={String(state.id)}>
                          {state.stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {isAddressSelected && (
                    <FormDescription>
                      Auto-filled from address
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchedState || stateCities.length === 0 || isLoadingCities || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        {isLoadingCities ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Loading cities...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder={!watchedState ? "Select state first" : stateCities.length === 0 ? "No cities for this state" : "Select city"} />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stateCities.map(city => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.cityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {isAddressSelected && (
                    <FormDescription>
                      Auto-filled from address
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            {/* Pincode field removed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyLocationStep;
