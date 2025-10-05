import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Property } from '@/lib/types/property';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeletePropertyDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * DeletePropertyDialog - Confirmation dialog for property deletion
 */
const DeletePropertyDialog: React.FC<DeletePropertyDialogProps> = ({
  property,
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}) => {
  if (!property) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="gap-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center text-xl">Delete Property</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete <span className="font-semibold">{property.propertyName}</span>?
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone and all data associated with this property will be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Property'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePropertyDialog;
