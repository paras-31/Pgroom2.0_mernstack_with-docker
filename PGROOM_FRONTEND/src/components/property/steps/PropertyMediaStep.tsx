import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { PropertyFormValues } from '../MultiStepPropertyForm';
import { Info, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Property } from '@/lib/types/property';

interface PropertyMediaStepProps {
  form: UseFormReturn<PropertyFormValues>;
  isSubmitting: boolean;
  property?: Property; // Add property prop to access the existing image
}

/**
 * PropertyMediaStep - Third step of the property form for media uploads
 */
const PropertyMediaStep: React.FC<PropertyMediaStepProps> = ({
  form,
  isSubmitting,
  property
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-muted-foreground mb-3 bg-muted/30 p-2 rounded">
        <Info className="h-4 w-4 flex-shrink-0" />
        <p className="text-xs">
          Upload a high-quality image of your property to increase interest from potential tenants.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3 px-4">
          {/* Property Image */}
          <FormField
            control={form.control}
            name="images"
            render={({ field: { value, onChange, ...fieldProps } }) => {
              return (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Property Image <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={value}
                      onChange={(file) => {
                        onChange(file);
                      }}
                      disabled={isSubmitting}
                      error={form.formState.errors.images?.message}
                      maxSizeInMB={5}
                      existingImageUrl={property?.propertyImage} // Pass the existing image URL
                    />
                  </FormControl>
                  <FormDescription className="mt-1 text-xs">
                    {property?.propertyImage
                      ? "Hover over the image and click to change it, or click 'Remove' to upload a new one."
                      : "Max file size: 5MB (PNG, JPG, JPEG)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Image tips - Compact layout */}
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium flex items-center">
                <ImageIcon className="h-3 w-3 mr-1" />
                Photo tips:
              </h4>
              <div className="flex flex-wrap gap-x-3 gap-y-0">
                <span className="text-xs text-muted-foreground">Natural light</span>
                <span className="text-xs text-muted-foreground">Main features</span>
                <span className="text-xs text-muted-foreground">Clean space</span>
                <span className="text-xs text-muted-foreground">Landscape mode</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyMediaStep;
