import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Property, PropertyCreateData } from '@/lib/types/property';
import { useLocation, City } from '@/contexts/LocationContext';
import { Loader2, Building, Phone } from 'lucide-react';
import { toast } from 'sonner';

// Import custom components
import AddressSearch from './AddressSearch';
import ImageUpload from './ImageUpload';

// Define the form schema with validation
const propertyFormSchema = z.object({
  propertyName: z.string().min(3, 'Property name must be at least 3 characters'),
  propertyAddress: z.string().min(5, 'Address must be at least 5 characters'),
  propertyContact: z.string().min(10, 'Contact number must be at least 10 digits').max(10, 'Contact number must be exactly 10 digits'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  images: z.instanceof(File, { message: 'At least one image is required' }), // Image is required
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyCreateData) => void;
  isSubmitting: boolean;
}

// Interface for address data from Google Places
interface AddressData {
  formattedAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  stateId?: number;
  cityId?: number;
}

/**
 * PropertyForm - Form component for adding or editing a property
 */
const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSubmit,
  isSubmitting
}) => {
  const { states, cities, loadCities, getCitiesByStateId } = useLocation();
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [addressSearchValue, setAddressSearchValue] = useState(property?.propertyAddress || '');
  const [isAddressSelected, setIsAddressSelected] = useState(!!property?.propertyAddress);

  // Initialize the form with default values or existing property data
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyName: property?.propertyName || '',
      propertyAddress: property?.propertyAddress || '',
      propertyContact: property?.propertyContact || '',
      state: property?.state || '',
      city: property?.city || '',
      images: undefined,
    },
    mode: 'onChange', // Validate on change for better user experience
  });

  // Watch the state field to load cities when it changes
  const watchedState = form.watch('state');

  useEffect(() => {
    if (watchedState) {
      const stateId = Number(watchedState);
      setIsLoadingCities(true);

      // First check if we already have the cities for this state
      const existingCities = getCitiesByStateId(stateId);
      if (existingCities.length > 0) {
        setStateCities(existingCities);
        setIsLoadingCities(false);

        // If there are no cities (only the placeholder), show a toast
        if (existingCities.length === 1 && existingCities[0].id === 0) {
          toast.info('No cities available for the selected state');
        }
      } else {
        // If not, load them
        loadCities(stateId).then(cityData => {
          setStateCities(cityData);
          setIsLoadingCities(false);

          // If there are no cities, show a toast
          if (cityData.length === 1 && cityData[0].id === 0) {
            toast.info('No cities available for the selected state');
          }
        }).catch(() => {
          setIsLoadingCities(false);
          toast.error('Failed to load cities');
        });
      }

      // Reset city when state changes
      if (!property || stateId !== property.state) {
        form.setValue('city', '');
      }
    } else {
      setStateCities([]);
    }
  }, [watchedState, loadCities, getCitiesByStateId, form, property]);

  // Handle address selection from Google Places
  const handleAddressSelect = useCallback((addressData: AddressData) => {
    // Update form fields with address data
    form.setValue('propertyAddress', addressData.streetAddress, { shouldValidate: true });
    setAddressSearchValue(addressData.streetAddress);
    setIsAddressSelected(true);

    // Find and set state if available
    if (addressData.state && states.length > 0) {
      const stateObj = states.find(s =>
        s.stateName.toLowerCase() === addressData.state.toLowerCase()
      );

      if (stateObj) {
        form.setValue('state', String(stateObj.id), { shouldValidate: true });

        // Load cities for this state
        const stateId = stateObj.id;
        const existingCities = getCitiesByStateId(stateId);

        if (existingCities.length > 0) {
          setStateCities(existingCities);

          // Find and set city if available
          if (addressData.city) {
            const cityObj = existingCities.find(c =>
              c.cityName.toLowerCase() === addressData.city.toLowerCase()
            );

            if (cityObj) {
              form.setValue('city', String(cityObj.id), { shouldValidate: true });
            }
          }
        } else {
          // Load cities and then try to set the city
          loadCities(stateId).then(cityData => {
            setStateCities(cityData);

            if (addressData.city && cityData.length > 0) {
              const cityObj = cityData.find(c =>
                c.cityName.toLowerCase() === addressData.city.toLowerCase()
              );

              if (cityObj) {
                form.setValue('city', String(cityObj.id), { shouldValidate: true });
              }
            }
          });
        }
      }
    }
  }, [form, states, getCitiesByStateId, loadCities]);

  // Handle form submission
  const handleSubmit = (values: PropertyFormValues) => {
    try {
      // Transform form values to match the API data structure
      const formattedData: PropertyCreateData = {
        propertyName: values.propertyName,
        propertyAddress: values.propertyAddress,
        propertyContact: values.propertyContact,
        state: Number(values.state),
        city: Number(values.city),
        images: values.images,
      };

      onSubmit(formattedData);
    } catch (error) {
      toast.error('Error submitting form. Please check all fields and try again.');
    }
  };

  // Handle address search input change
  const handleAddressSearchChange = (value: string, addressData?: AddressData) => {
    setAddressSearchValue(value);
    form.setValue('propertyAddress', value, { shouldValidate: true });

    // If value is empty, reset the address selected state
    if (value === '') {
      setIsAddressSelected(false);
    }

    // If we have address data and it wasn't set by handleAddressSelect, process it
    if (addressData) {
      handleAddressSelect(addressData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Property Name */}
          <FormField
            control={form.control}
            name="propertyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Enter property name" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter a descriptive name for your property listing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property Address with Google Places */}
          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem>
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

          {/* State and City - Two columns */}
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
                    disabled={isSubmitting || isAddressSelected}
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
                      State is auto-filled from the selected address
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
                    disabled={!watchedState || stateCities.length === 0 || isLoadingCities || isSubmitting || isAddressSelected}
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
                      City is auto-filled from the selected address
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Property Contact */}
          <FormField
            control={form.control}
            name="propertyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter 10-digit mobile number"
                      className="pl-10"
                      maxLength={10}
                      {...field}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter a 10-digit mobile number for property inquiries
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property Image */}
          <FormField
            control={form.control}
            name="images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="flex items-center">Property Image <span className="text-red-500 ml-1">*</span></FormLabel>
                <FormControl>
                  <ImageUpload
                    value={value}
                    onChange={onChange}
                    disabled={isSubmitting}
                    error={form.formState.errors.images?.message}
                    maxSizeInMB={5}
                  />
                </FormControl>
                <FormDescription>
                  Upload a high-quality image of your property (max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {property ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              property ? 'Update Property' : 'Add Property'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;
