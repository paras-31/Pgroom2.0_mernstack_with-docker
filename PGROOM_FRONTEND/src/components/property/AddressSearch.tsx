import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

// Define the address components we'll extract from Google Places
interface AddressComponents {
  street_number?: string;
  route?: string;
  sublocality_level_1?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
}

interface AddressData {
  formattedAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  stateId?: number;
  cityId?: number;
}

interface AddressSearchProps {
  value: string;
  onChange: (value: string, addressData?: AddressData) => void;
  onAddressSelect?: (addressData: AddressData) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  states: Array<{ id: number; stateName: string }>;
  cities: Record<number, Array<{ id: number; cityName: string }>>;
  readOnly?: boolean;
}

/**
 * AddressSearch component with Google Places Autocomplete
 * Restricted to India addresses only
 */
const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Search for an address',
  disabled = false,
  error,
  className,
  states,
  cities,
  readOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Check if Google Maps script is loaded
  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }

    // If not loaded yet, set up a listener for when it loads
    const checkGoogleMapsLoaded = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsScriptLoaded(true);
        clearInterval(checkGoogleMapsLoaded);
      }
    }, 100);

    // Clean up interval on unmount
    return () => {
      clearInterval(checkGoogleMapsLoaded);
    };
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current) return;

    try {
      const options: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address']
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.address_components) return;

        setIsLoading(true);

        try {
          // Extract address components
          const addressComponents: AddressComponents = {};
          place.address_components.forEach(component => {
            const type = component.types[0];
            if (type) {
              addressComponents[type as keyof AddressComponents] = component.long_name;
            }
          });

          // Format the address data
          const streetNumber = addressComponents.street_number || '';
          const route = addressComponents.route || '';
          const sublocality = addressComponents.sublocality_level_1 || '';
          const locality = addressComponents.locality || '';
          const state = addressComponents.administrative_area_level_1 || '';

          // Create street address without state, city, and pincode
          const streetAddress = [
            streetNumber,
            route,
            sublocality
          ].filter(Boolean).join(', ');

          // Find state ID from the states array
          const stateObj = states.find(s =>
            s.stateName.toLowerCase() === state.toLowerCase()
          );

          const stateId = stateObj?.id;

          // Find city ID from the cities object
          let cityId: number | undefined;
          if (stateId && cities[stateId]) {
            const cityObj = cities[stateId].find(c =>
              c.cityName.toLowerCase() === locality.toLowerCase()
            );
            cityId = cityObj?.id;
          }

          // Create address data object
          const addressData: AddressData = {
            formattedAddress: place.formatted_address || '',
            streetAddress,
            city: locality,
            state,
            stateId,
            cityId
          };

          // Update the input value with the formatted address
          onChange(streetAddress, addressData);

          // Mark address as selected to make it read-only
          setIsAddressSelected(true);

          // Call the onAddressSelect callback if provided
          if (onAddressSelect) {
            onAddressSelect(addressData);
          }
        } catch (error) {
          console.error('Error processing address:', error);
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [isScriptLoaded, onChange, onAddressSelect, states, cities]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow changes if address hasn't been selected yet
    if (!isAddressSelected) {
      onChange(e.target.value);

      // If user is typing manually, we're no longer in a selected state
      if (e.target.value === '') {
        setIsAddressSelected(false);
      }
    }
  };

  // Handle clear button click
  const handleClearAddress = () => {
    onChange('');
    setIsAddressSelected(false);

    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <MapPin
        className={cn(
          "absolute left-3 top-2.5 h-5 w-5 z-10",
          error ? "text-destructive" : "text-muted-foreground",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || !isScriptLoaded}
          readOnly={readOnly || isAddressSelected}
          className={cn(
            "pl-10 pr-10 bg-background",
            error && "border-destructive focus-visible:ring-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            (readOnly || isAddressSelected) && "bg-muted cursor-not-allowed",
            className
          )}
          aria-invalid={!!error}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        {isAddressSelected && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClearAddress}
            aria-label="Clear address"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {!isScriptLoaded && (
          <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Loading Google Maps...</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddressSearch;
