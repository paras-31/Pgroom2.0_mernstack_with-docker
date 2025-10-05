import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, X, Upload, Image as ImageIcon, Plus, Minus,
  BedDouble, Check, ArrowRight, ArrowLeft, FileText,
  Camera, Home, CheckCircle2, IndianRupee,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Add custom styles for required asterisk
import './form-styles.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// API and services
import { roomService } from '@/lib/api/services';
import { isApiSuccessResponse } from '@/lib/types/api';

// Define the form schema with Zod
const formSchema = z.object({
  roomNo: z.string().min(1, 'Room number is required'),
  totalBeds: z.coerce.number().int().min(1, 'At least 1 bed is required').max(4, 'Maximum 4 beds allowed'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description must be less than 500 characters'),
  rent: z.coerce.number().min(1, 'Rent must be greater than 0'),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  onSuccess?: () => void;
}

// Define the steps for the multi-step form
type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    id: 'room-details',
    title: 'Room Details',
    description: 'Enter basic room information',
    icon: <BedDouble className="h-5 w-5" />,
  },
  {
    id: 'room-description',
    title: 'Description',
    description: 'Describe the room features',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'room-images',
    title: 'Images',
    description: 'Upload room photos',
    icon: <Camera className="h-5 w-5" />,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and submit',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
];

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, propertyId, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Log when the modal is opened or closed
  React.useEffect(() => {
    console.log("AddRoomModal isOpen:", isOpen, "propertyId:", propertyId);
  }, [isOpen, propertyId]);

  // State for current step
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(25);

  // State for image uploads
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // State for tracking image loading errors
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([]);

  // State for tracking current image in the review slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNo: '',
      totalBeds: 1,
      description: '',
      rent: 0,
    },
    mode: 'onChange',
  });

  // State for loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom FormLabel with red asterisk for required fields
  const RequiredFormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <FormLabel>
      {children}
      <span className="required-asterisk">&nbsp;*</span>
    </FormLabel>
  );

  // Step navigation function with validation
  const nextStep = async () => {
    // Validate current step before proceeding
    let isValid = true;

    if (currentStep === 0) {
      // Validate room details step
      isValid = await form.trigger(['roomNo', 'totalBeds', 'rent']);

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly",
          variant: "destructive",
        });
        return;
      }
    }
    else if (currentStep === 1) {
      // Validate description step
      isValid = await form.trigger('description');

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please provide a valid description (5-500 characters)",
          variant: "destructive",
        });
        return;
      }
    }
    else if (currentStep === 2) {
      // Validate images step
      if (images.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please upload at least one image",
          variant: "destructive",
        });
        return;
      }

      if (images.length > 5) {
        toast({
          title: "Validation Error",
          description: "Maximum 5 images allowed",
          variant: "destructive",
        });
        return;
      }
    }

    // If validation passed, move to next step
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(Math.min(100, (currentStep + 2) * 25));
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(Math.max(25, (currentStep) * 25));
    }
  };

  // Reset form and state when closing modal
  const handleClose = () => {
    form.reset();
    setImages([]);
    setImagePreviewUrls([]);
    setCurrentStep(0);
    setProgress(25);
    onClose();
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    // If not on the last step, validate and move to next step
    if (currentStep < steps.length - 1) {
      await nextStep();
      return;
    }
  };

  // Separate function for final submission to avoid form validation issues
  const handleFinalSubmit = async () => {
    // Set loading state
    setIsSubmitting(true);

    try {
      // Get current form values
      const data = form.getValues();

      // Validate images
      if (images.length === 0) {
        toast({
          title: 'Error',
          description: 'Please upload at least one image',
          variant: 'destructive',
        });
        return;
      }

      if (images.length > 5) {
        toast({
          title: 'Error',
          description: 'Maximum 5 images allowed',
          variant: 'destructive',
        });
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('propertyId', propertyId.toString());
      formData.append('roomNo', data.roomNo);
      formData.append('totalBeds', data.totalBeds.toString());
      formData.append('description', data.description);
      formData.append('rent', data.rent.toString());
      formData.append('status', 'Available'); // Add default status

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Submit form with FormData
      setIsUploading(true);
      const response = await roomService.createRoom(formData);

      if (!isApiSuccessResponse(response)) {
        throw new Error(response.message || 'Failed to add room');
      }

      // Invalidate all related queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });

      // Show success toast with green color
      toast({
        title: 'Room Added',
        description: 'The room has been added successfully.',
        variant: 'success',
      });

      // Reset form and close modal
      handleClose();

      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      } else {
        console.log("No onSuccess callback provided");
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was a problem submitting the form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to array and add to existing images
    const newFiles = Array.from(files);
    const updatedImages = [...images, ...newFiles];

    // Limit to 5 images
    if (updatedImages.length > 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 images allowed',
        variant: 'destructive',
      });
      return;
    }

    setImages(updatedImages);

    try {
      // Create preview URLs with error handling
      const newPreviewUrls = newFiles.map((file) => {
        try {
          // Create a more persistent blob URL
          return URL.createObjectURL(file);
        } catch (error) {
          return "";
        }
      }).filter(url => url !== ""); // Filter out any failed URLs

      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem processing the images. Please try again.',
        variant: 'destructive',
      });
    }

    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index: number) => {
    // Remove image and preview URL
    const updatedImages = [...images];
    const updatedPreviewUrls = [...imagePreviewUrls];

    // Don't revoke the URL here - we'll do it when the component unmounts
    // This prevents issues with the URLs being invalid when navigating between steps

    updatedImages.splice(index, 1);
    updatedPreviewUrls.splice(index, 1);

    setImages(updatedImages);
    setImagePreviewUrls(updatedPreviewUrls);
  };

  // Handle image load error
  const handleImageError = (index: number) => {
    const newErrors = [...imageLoadErrors];
    newErrors[index] = true;
    setImageLoadErrors(newErrors);
  };

  // Create a safe image URL with fallback
  const getSafeImageUrl = (index: number): string => {
    try {
      // If we have a valid URL and no error, use it
      if (index < imagePreviewUrls.length && !imageLoadErrors[index]) {
        return imagePreviewUrls[index];
      }

      // Otherwise, create a new URL from the File object
      if (index < images.length) {
        return URL.createObjectURL(images[index]);
      }

      // Fallback
      return '';
    } catch (error) {
      return '';
    }
  };

  // Image slider navigation functions
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
  };

  // Reset current image index when step changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentStep]);

  // Only clean up preview URLs when component unmounts, not on every render
  React.useEffect(() => {
    return () => {
      // Only revoke URLs when the component is unmounting
      if (isOpen === false) {
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, []);

  // Effect to handle step changes and preload images
  React.useEffect(() => {
    // Reset image load errors when images change
    setImageLoadErrors(Array(images.length).fill(false));

    // If moving to review step, preload images to ensure they're available
    if (currentStep === 3 && imagePreviewUrls.length > 0) {
      // Preload images
      imagePreviewUrls.forEach((url, index) => {
        const img = new Image();
        img.onerror = () => {
          // Mark this image as having an error
          const newErrors = [...imageLoadErrors];
          newErrors[index] = true;
          setImageLoadErrors(newErrors);
        };
        img.src = url;
      });
    }
  }, [currentStep, images, imagePreviewUrls]);

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center text-center p-2 rounded-md transition-colors",
                currentStep === index
                  ? "bg-primary/10 text-primary"
                  : index < currentStep
                    ? "bg-primary/5 text-primary/80"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                currentStep === index
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6" key="room-details-step">
            {/* Room Number */}
            <FormField
              control={form.control}
              name="roomNo"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Room Number</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 101, A1, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a unique identifier for this room.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Beds */}
            <FormField
              control={form.control}
              name="totalBeds"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Total Beds</RequiredFormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-r-none"
                        onClick={() => {
                          const newValue = Math.max(1, field.value - 1);
                          form.setValue('totalBeds', newValue);
                        }}
                        disabled={field.value <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="text"
                        className="rounded-none text-center flex-1"
                        readOnly
                        value={field.value}
                        onChange={() => {}} // Empty handler to avoid React warning
                        style={{ cursor: 'default', pointerEvents: 'none' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-l-none"
                        onClick={() => {
                          const newValue = Math.min(4, field.value + 1);
                          form.setValue('totalBeds', newValue);
                        }}
                        disabled={field.value >= 4}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Number of beds in this room (1-4).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rent */}
            <FormField
              control={form.control}
              name="rent"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Monthly Rent (₹)</RequiredFormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 8000"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Monthly rent amount in Rupees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6" key="room-description-step">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Description</RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the room, its features, amenities, etc."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the room (5-500 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" key="room-images-step">
            {/* Image Upload */}
            <div className="space-y-4">
              <div>
                <div className="block mb-2">
                  <RequiredFormLabel>Room Images</RequiredFormLabel>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('room-images')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                  <Input
                    id="room-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <FormDescription className="mt-2">
                  Upload 1-5 images of the room (JPEG, PNG, WebP).
                </FormDescription>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Room preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {imagePreviewUrls.length === 0 && (
                <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No images uploaded yet. Please upload at least one image.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:

        return (
          <div className="space-y-6" key="room-review-step">
            <h3 className="text-lg font-medium">Review Room Details</h3>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Image preview */}
                {/* Image Gallery */}
                {images.length > 0 ? (
                  <div>
                    {/* Image Slider */}
                    <div className="relative h-48 bg-muted">
                      {/* Main Image */}
                      <img
                        src={getSafeImageUrl(currentImageIndex)}
                        alt={`Room preview ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(currentImageIndex)}
                      />

                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md">
                        {currentImageIndex + 1} / {images.length}
                      </div>

                      {/* Navigation Buttons */}
                      {images.length > 1 && (
                        <>
                          {/* Previous Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          {/* Next Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex overflow-x-auto gap-2 p-2 bg-muted/50">
                        {images.map((file, idx) => (
                          <div
                            key={idx}
                            className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 cursor-pointer ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img
                              src={getSafeImageUrl(idx)}
                              alt={`Room thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(idx)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                      <p>No images available for preview</p>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{form.getValues('roomNo')}</h4>
                      <p className="text-muted-foreground text-sm">
                        {form.getValues('totalBeds')} {form.getValues('totalBeds') === 1 ? 'Bed' : 'Beds'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">₹{form.getValues('rent')}</p>
                      <p className="text-muted-foreground text-xs">per month</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h5 className="font-medium mb-1 text-sm">Description</h5>
                    <p className="text-sm text-muted-foreground">
                      {form.getValues('description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderNavigation = () => {
    return (
      <div className="flex justify-between mt-6">
        {currentStep > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting || isUploading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
        )}

        {currentStep < steps.length - 1 ? (
          // Next button for intermediate steps
          <Button
            type="button"
            onClick={async () => {
              await nextStep();
            }}
            disabled={isSubmitting || isUploading}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          // Submit button for final step - using direct handler instead of form submission
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting || isUploading}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Room...
              </>
            ) : (
              'Add Room'
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        {renderStepIndicators()}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation */}
            {renderNavigation()}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomModal;
