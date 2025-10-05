import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Property, PropertyCreateData } from '@/lib/types/property';
import { useLocation } from '@/contexts/LocationContext';
import { Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { extractImagePathFromS3Url } from '@/lib/utils';

// Import step components
import PropertyBasicInfoStep from './steps/PropertyBasicInfoStep';
import PropertyLocationStep from './steps/PropertyLocationStep';
import PropertyMediaStep from './steps/PropertyMediaStep';

// Define the form schema with validation
const propertyFormSchema = z.object({
  propertyName: z.string().min(3, 'Property name must be at least 3 characters'),
  propertyAddress: z.string().min(5, 'Address must be at least 5 characters'),
  propertyContact: z.string().min(10, 'Contact number must be at least 10 digits').max(10, 'Contact number must be exactly 10 digits'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  images: z.instanceof(File, { message: 'At least one image is required' }).nullable().optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface MultiStepPropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyCreateData) => void;
  isSubmitting: boolean;
}

/**
 * MultiStepPropertyForm - Enhanced form component with multi-step UI for adding or editing a property
 */
const MultiStepPropertyForm: React.FC<MultiStepPropertyFormProps> = ({
  property,
  onSubmit,
  isSubmitting
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [addressSearchValue, setAddressSearchValue] = useState(property?.propertyAddress || '');
  // Don't set isAddressSelected to true by default for edit mode to allow state/city selection
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const { states } = useLocation();

  // Steps configuration
  const steps = [
    { id: 'basic-info', title: 'Basic Info' },
    { id: 'location', title: 'Location' },
    { id: 'media', title: 'Media' },
  ];

  // Initialize the form with default values or existing property data
  // Ensure state and city are properly converted to strings
  const stateValue = property?.state ? String(property.state) : '';
  const cityValue = property?.city ? String(property.city) : '';

  const defaultValues = {
    propertyName: property?.propertyName || '',
    propertyAddress: property?.propertyAddress || '',
    propertyContact: property?.propertyContact || '',
    state: stateValue,
    city: cityValue,
    images: undefined,
  };



  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on change for better user experience
  });

  // If editing a property, ensure the state and city values are set
  useEffect(() => {
    if (property) {
      // Find state ID by name if property.state is a string name
      if (property.state && typeof property.state === 'string' && isNaN(Number(property.state))) {
        const stateObj = states.find(s =>
          s.stateName.toLowerCase() === property.state.toString().toLowerCase()
        );

        if (stateObj) {
          form.setValue('state', String(stateObj.id), { shouldValidate: true });
        } else {
          form.setValue('state', String(property.state), { shouldValidate: true });
        }
      } else if (property.state) {
        // If it's already an ID or can be converted to a number
        form.setValue('state', String(property.state), { shouldValidate: true });
      }

      // We'll handle city in the PropertyLocationStep component after state is set and cities are loaded
    }
  }, [property, form, states]);

  // Watch form values for validation
  const watchedState = form.watch('state');
  const watchedCity = form.watch('city');
  const watchedPropertyName = form.watch('propertyName');
  const watchedPropertyContact = form.watch('propertyContact');
  const watchedPropertyAddress = form.watch('propertyAddress');
  const watchedImages = form.watch('images');

  // Determine if the current step is valid
  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 0: // Basic Info
        return !!watchedPropertyName && watchedPropertyName.length >= 3 &&
               !!watchedPropertyContact && watchedPropertyContact.length === 10;
      case 1: // Location
        return !!watchedPropertyAddress && watchedPropertyAddress.length >= 5 &&
               !!watchedState && !!watchedCity;
      case 2: // Media
        // If editing (property exists) and no new image is selected, consider it valid
        // because we'll use the existing image
        return property ? true : !!watchedImages;
      default:
        return false;
    }
  }, [
    currentStep,
    watchedPropertyName,
    watchedPropertyContact,
    watchedPropertyAddress,
    watchedState,
    watchedCity,
    watchedImages,
    property
  ]);

  // Handle address selection from Google Places
  const handleAddressSelect = useCallback((addressData: any) => {
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
      }
    }

    // Pincode handling removed
  }, [form, states]);

  // Handle address search input change
  const handleAddressSearchChange = (value: string, addressData?: any) => {
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

  // Handle next step
  const handleNext = (e: React.MouseEvent) => {
    // Prevent form submission when clicking Next
    e.preventDefault();

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = (e: React.MouseEvent) => {
    // Prevent form submission when clicking Previous
    e.preventDefault();

    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = (values: PropertyFormValues) => {
    try {
      // Check if image is selected for new properties
      if (!property && !values.images) {
        toast.error('Please select an image for your property');
        return;
      }

      // Transform form values to match the API data structure
      const formattedData: PropertyCreateData = {
        propertyName: values.propertyName,
        propertyAddress: values.propertyAddress,
        propertyContact: values.propertyContact,
        state: Number(values.state),
        city: Number(values.city),
      };

      // Handle image submission based on whether it's a new upload or existing image
      if (values.images) {
        // If a new image was selected, include it in the payload
        formattedData.images = values.images;
      } else if (property && property.propertyImage && !values.images) {
        // If editing and no new image was selected, extract and include the existing image path
        const imagePath = extractImagePathFromS3Url(property.propertyImage);
        if (imagePath) {
          // Add the extracted image path to the payload using the same 'images' key
          formattedData.images = imagePath;
        }
      }

      onSubmit(formattedData);
    } catch (error) {
      toast.error('Error submitting form. Please check all fields and try again.');
    }
  };

  // Prevent form submission when pressing Enter
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    // Always prevent Enter key from submitting the form
    if (e.key === 'Enter') {
      e.preventDefault();

      // If on the last step and all fields are valid, manually submit the form
      if (currentStep === steps.length - 1 && form.formState.isValid && !isSubmitting) {
        form.handleSubmit(handleSubmit)();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" onKeyDown={handleFormKeyDown}>
        {/* Progress indicator - Compact */}
        <div className="mb-4">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index < currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-full">
              <div
                className="h-1 bg-primary rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[280px]">
          {currentStep === 0 && (
            <PropertyBasicInfoStep
              form={form}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 1 && (
            <PropertyLocationStep
              form={form}
              isSubmitting={isSubmitting}
              addressSearchValue={addressSearchValue}
              isAddressSelected={isAddressSelected}
              handleAddressSearchChange={handleAddressSearchChange}
              handleAddressSelect={handleAddressSelect}
            />
          )}

          {currentStep === 2 && (
            <PropertyMediaStep
              form={form}
              isSubmitting={isSubmitting}
              property={property}
            />
          )}
        </div>

        {/* Navigation buttons - Compact */}
        <div className="flex justify-between pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious(e);
            }}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleNext(e);
              }}
              disabled={!isStepValid() || isSubmitting}
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!form.formState.isValid || isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  {property ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                property ? 'Update Property' : 'Add Property'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default MultiStepPropertyForm;
