import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  isLoading?: boolean;
}

/**
 * Specialized input for Indian pincodes with validation
 */
const PincodeInput: React.FC<PincodeInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter pincode',
  disabled = false,
  error,
  className,
  isLoading = false
}) => {
  // Handle input changes with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(input) && input.length <= 6) {
      onChange(input);
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
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "pl-10 bg-background",
          error && "border-destructive focus-visible:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-invalid={!!error}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
      )}
      {error && (
        <p className="text-sm font-medium text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PincodeInput;
