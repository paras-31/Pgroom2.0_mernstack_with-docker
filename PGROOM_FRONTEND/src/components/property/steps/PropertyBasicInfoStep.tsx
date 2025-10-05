import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Building, Phone, Info } from 'lucide-react';
import { PropertyFormValues } from '../MultiStepPropertyForm';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyBasicInfoStepProps {
  form: UseFormReturn<PropertyFormValues>;
  isSubmitting: boolean;
}

/**
 * PropertyBasicInfoStep - First step of the property form for basic information
 */
const PropertyBasicInfoStep: React.FC<PropertyBasicInfoStepProps> = ({
  form,
  isSubmitting
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-3 text-muted-foreground mb-6">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          Start by providing the basic details about your property. A descriptive name and valid contact number will help potential tenants identify and reach out about your property.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Property Name */}
          <FormField
            control={form.control}
            name="propertyName"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Enter property name" 
                      className="pl-10" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter a descriptive name for your property listing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      disabled={isSubmitting}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyBasicInfoStep;
