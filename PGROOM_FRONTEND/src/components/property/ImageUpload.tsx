import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxSizeInMB?: number;
  existingImageUrl?: string; // Add prop for existing image URL
}

/**
 * Simplified image upload component with preview
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  className,
  maxSizeInMB = 5, // Default max size: 5MB
  existingImageUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const [isExistingImage, setIsExistingImage] = useState(!!existingImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Generate preview when file changes or when existingImageUrl is provided
  React.useEffect(() => {
    if (value) {
      // If we have a file, create a preview from it
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      setIsExistingImage(false);

      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else if (existingImageUrl) {
      // If we have an existing image URL but no file, use the URL
      setPreview(existingImageUrl);
      setIsExistingImage(true);
      return;
    } else {
      // If we have neither, clear the preview
      setPreview(null);
      setIsExistingImage(false);
    }
  }, [value, existingImageUrl]);

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    // Validate file size
    if (file.size > maxSizeInBytes) {
      toast.error(`File size exceeds the maximum limit of ${maxSizeInMB}MB.`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed. Please select a PNG, JPG, or JPEG file.');
      return;
    }

    onChange(file);
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  // Remove selected file
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload area */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-input",
          error ? "border-destructive" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Property preview"
              className="object-contain w-full h-full p-4"
              style={{ maxHeight: "calc(100% - 16px)" }}
            />
            <div className="absolute top-3 right-3 z-10">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 px-2 rounded-md bg-red-500 text-white shadow-md hover:bg-red-600 border-none"
                onClick={handleRemoveFile}
                title="Remove image"
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" /> Remove
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
            {isExistingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={openFileDialog}>
                <div className="bg-primary text-primary-foreground rounded-full p-3">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="absolute bottom-4 text-white font-medium text-sm bg-black/60 px-3 py-1 rounded-full">
                  Click to change image
                </span>
              </div>
            ) : (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {value?.name} ({(value?.size / (1024 * 1024)).toFixed(2)}MB)
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center p-4 w-full h-full"
            onClick={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.stopPropagation();
              openFileDialog();
            }}
          >
            <div className="mb-2 p-3 rounded-full bg-primary/10">
              <FileImage className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG or JPEG (max {maxSizeInMB}MB)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFileDialog();
              }}
              disabled={disabled}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Select Image
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
