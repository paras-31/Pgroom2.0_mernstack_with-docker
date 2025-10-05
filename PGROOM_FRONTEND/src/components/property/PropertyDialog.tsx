import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Property, PropertyCreateData } from '@/lib/types/property';
import MultiStepPropertyForm from './MultiStepPropertyForm';

interface PropertyDialogProps {
  property?: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PropertyCreateData) => void;
  isSubmitting: boolean;
}

/**
 * PropertyDialog - Dialog for adding or editing a property
 */
const PropertyDialog: React.FC<PropertyDialogProps> = ({
  property,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  // Remove console.log for production
  // Wrap the dialog in a try-catch to catch any rendering errors
  try {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription className="text-xs">
            {property
              ? 'Update your property details. Complete all steps to save changes.'
              : 'Fill in the details to add a new property. Follow the steps to complete.'}
          </DialogDescription>
        </DialogHeader>

        <MultiStepPropertyForm
          property={property}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
  } catch (error) {
    console.error('Error rendering PropertyDialog:', error);
    return null;
  }
};

export default PropertyDialog;
