import { UseFormRegister, Path, Controller, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps<T extends Record<string, any>> {
  icon: React.ElementType;
  placeholder: string;
  options: SelectOption[];
  control: Control<T>;
  name: Path<T>;
  error?: string;
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export const FormSelect = <T extends Record<string, any>>({
  icon: Icon,
  placeholder,
  options,
  control,
  name,
  error,
  className,
  disabled = false,
  onValueChange,
}: FormSelectProps<T>) => (
  <div className="relative">
    <Icon
      className={cn(
        "absolute left-3 top-2.5 h-5 w-5 z-10",
        error ? "text-destructive" : "text-muted-foreground",
        disabled && "opacity-50"
      )}
      aria-hidden="true"
    />
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          disabled={disabled}
          onValueChange={(value) => {
            // Update the field value
            field.onChange(value);
            // Mark the field as touched to trigger validation
            field.onBlur();
            // Call the custom value change handler if provided
            if (onValueChange) onValueChange(value);
          }}
          value={field.value?.toString() || ""}
        >
          <SelectTrigger
            className={cn(
              "pl-10 bg-background",
              error && "border-destructive focus-visible:ring-destructive",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${String(name)}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {error && (
      <p
        id={`${String(name)}-error`}
        className="text-sm font-medium text-destructive mt-1"
        role="alert"
      >
        {error}
      </p>
    )}
  </div>
);
