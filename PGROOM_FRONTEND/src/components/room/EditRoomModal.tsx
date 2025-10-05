import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// API and services
import { roomService, Room } from '@/lib/api/services/roomService';
import { isApiSuccessResponse } from '@/lib/types/api';

// Define the form schema with Zod
const formSchema = z.object({
  roomNo: z.union([
    z.string().min(1, 'Room number is required'),
    z.number().transform(val => String(val)) // Convert number to string if needed
  ]),
  totalBeds: z.coerce.number().int().min(1, 'At least 1 bed is required').max(4, 'Maximum 4 beds allowed'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description must be less than 500 characters'),
  rent: z.coerce.number().min(1, 'Rent must be greater than 0'),
  status: z.string().min(1, 'Status is required'),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface EditRoomModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
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
    description: 'Update basic room information',
    icon: <BedDouble className="h-5 w-5" />,
  },
  {
    id: 'room-description',
    title: 'Description',
    description: 'Update the room description',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'room-images',
    title: 'Images',
    description: 'Update room photos',
    icon: <Camera className="h-5 w-5" />,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and submit changes',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
];

const EditRoomModal: React.FC<EditRoomModalProps> = ({ room, isOpen, onClose, propertyId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for current step
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(25);

  // State for image uploads
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useExistingImages, setUseExistingImages] = useState(true);

  // State for tracking image loading errors
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>([]);

  // State for tracking current image in the review slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize form with room data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNo: room.roomNo ? String(room.roomNo) : '', // Ensure roomNo is always a string
      totalBeds: room.totalBed || 1,
      description: room.description || '',
      rent: typeof room.rent === 'string' ? parseFloat(room.rent) : room.rent || 0,
      status: room.status || 'Available',
    },
    mode: 'onTouched', // Only validate after field is touched
  });

  // State for loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up existing room images
  useEffect(() => {
    if (room.roomImage) {
      // Handle both string and array formats
      const imageUrls = Array.isArray(room.roomImage)
        ? room.roomImage
        : [room.roomImage];

      // Set preview URLs for existing images
      setImagePreviewUrls(imageUrls);
    }
  }, [room]);

  // Clear validation errors when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form errors without resetting values
      form.clearErrors();
    }
  }, [isOpen, form]);

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
      // Clear any existing errors first
      form.clearErrors(['roomNo', 'totalBeds', 'rent', 'status']);

      // Check if fields have values before validation
      const values = form.getValues();
      // Ensure roomNo is treated as a string
      const roomNoValue = values.roomNo ? String(values.roomNo) : '';
      const hasRoomNo = !!roomNoValue;
      const hasTotalBeds = values.totalBeds >= 1 && values.totalBeds <= 4;
      const hasRent = values.rent > 0;
      const hasStatus = !!values.status;

      // Only validate if all fields have values
      if (hasRoomNo && hasTotalBeds && hasRent && hasStatus) {
        isValid = await form.trigger(['roomNo', 'totalBeds', 'rent', 'status']);
      } else {
        // Manually check which fields are missing
        if (!hasRoomNo) form.setError('roomNo', { message: 'Room number is required' });
        if (!hasTotalBeds) form.setError('totalBeds', { message: 'Total beds must be between 1 and 4' });
        if (!hasRent) form.setError('rent', { message: 'Rent must be greater than 0' });
        if (!hasStatus) form.setError('status', { message: 'Status is required' });
        isValid = false;
      }

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
      // Clear any existing errors first
      form.clearErrors('description');

      // Check if description has value before validation
      const description = form.getValues('description');
      if (description && description.length >= 5 && description.length <= 500) {
        isValid = await form.trigger('description');
      } else {
        form.setError('description', {
          message: 'Description must be between 5 and 500 characters'
        });
        isValid = false;
      }

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
      if (!useExistingImages && images.length === 0 && (!room.roomImage || (Array.isArray(room.roomImage) && room.roomImage.length === 0))) {
        toast({
          title: "Validation Error",
          description: "Please upload at least one image or keep existing images",
          variant: "destructive",
        });
        return;
      }
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress((currentStep + 2) * (100 / steps.length));
    }
  };

  // Handle previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress((currentStep) * (100 / steps.length));
    }
  };

  // Reset form and state when closing modal
  const handleClose = () => {
    form.reset();
    setImages([]);
    setImagePreviewUrls([]);
    setCurrentStep(0);
    setProgress(25);
    setUseExistingImages(true);
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);

      // Limit to 5 images total
      const totalImages = images.length + fileList.length;
      if (totalImages > 5) {
        toast({
          title: "Too Many Images",
          description: "You can upload a maximum of 5 images",
          variant: "destructive",
        });
        return;
      }

      // Add new images
      const newImages = [...images, ...fileList];
      setImages(newImages);

      // Create preview URLs
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newPreviewUrls);

      // When adding new images, set to not use existing images
      setUseExistingImages(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);

    // Reset current image index if needed
    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Handle image error
  const handleImageError = (index: number) => {
    const newErrors = [...imageLoadErrors];
    newErrors[index] = true;
    setImageLoadErrors(newErrors);
  };

  // Get safe image URL with fallback
  const getSafeImageUrl = (index: number) => {
    if (index < 0 || index >= imagePreviewUrls.length) {
      return '';
    }
    return imageLoadErrors[index] ? '/placeholder-image.jpg' : imagePreviewUrls[index];
  };

  // Separate function for final submission to avoid form validation issues
  const handleFinalSubmit = async () => {
    // Set loading state
    setIsSubmitting(true);

    try {
      const data = form.getValues();

      // Validate all fields
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please check all fields and try again",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('propertyId', propertyId.toString());
      formData.append('roomNo', String(data.roomNo)); // Ensure roomNo is a string
      formData.append('totalBeds', data.totalBeds.toString());
      formData.append('description', data.description);
      formData.append('rent', data.rent.toString());
      formData.append('status', data.status);
      formData.append('id', room.id.toString());

      // Handle images based on whether we're using existing images or new ones
      if (useExistingImages) {
        formData.append('useExistingImage', 'true');
      } else {
        formData.append('useExistingImage', 'false');

        // Append new images if any
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Submit form with FormData
      setIsUploading(true);
      const response = await roomService.updateRoom(formData);

      if (!isApiSuccessResponse(response)) {
        throw new Error(response.message || 'Failed to update room');
      }

      // Invalidate all related queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });

      // Show success toast with green color
      toast({
        title: 'Room Updated',
        description: 'The room has been updated successfully.',
        variant: 'success',
      });

      // Reset form and close modal
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was a problem updating the room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center space-y-2",
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  index < currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="text-xs font-medium text-center">
                {step.title}
              </div>
            </div>
          ))}
        </div>

        <Progress value={progress} className="mt-4 h-2" />
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
                    <div className="flex">
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Room Status</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current status of the room.
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
              {/* Option to keep existing images */}
              {room.roomImage && (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <div className="flex h-4 w-4 items-center justify-center pt-1">
                    <input
                      type="checkbox"
                      checked={useExistingImages}
                      onChange={(e) => setUseExistingImages(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Keep existing images
                    </FormLabel>
                    <FormDescription>
                      Uncheck to replace all existing images with new uploads.
                    </FormDescription>
                  </div>
                </FormItem>
              )}

              {/* Show existing images if keeping them */}
              {useExistingImages && room.roomImage && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.isArray(room.roomImage) ? (
                      room.roomImage.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Room image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <img
                          src={room.roomImage}
                          alt="Room image"
                          className="w-full h-24 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload new images section */}
              {!useExistingImages && (
                <>
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
                </>
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
                {imagePreviewUrls.length > 0 ? (
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
                        {currentImageIndex + 1} / {imagePreviewUrls.length}
                      </div>

                      {/* Navigation Arrows */}
                      {imagePreviewUrls.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? imagePreviewUrls.length - 1 : prev - 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            onClick={() => setCurrentImageIndex(prev => (prev === imagePreviewUrls.length - 1 ? 0 : prev + 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {imagePreviewUrls.length > 1 && (
                      <div className="flex overflow-x-auto gap-2 p-2 bg-muted/50">
                        {imagePreviewUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 cursor-pointer ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img
                              src={url}
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

                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium mb-1 text-sm">Status</h5>
                      <p className="text-sm">{form.getValues('status')}</p>
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
        {/* Back button */}
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting || isUploading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

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
                Updating Room...
              </>
            ) : (
              'Update Room'
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
          <DialogTitle>Edit Room</DialogTitle>
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

export default EditRoomModal;
