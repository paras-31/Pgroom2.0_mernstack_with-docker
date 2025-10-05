import { UseFormRegister, Path, Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormInputProps<T extends Record<string, string | boolean | undefined>> {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: string;
  className?: string;
  disabled?: boolean;
  control?: Control<T>; // Optional control prop for using Controller
}

export const FormInput = <T extends Record<string, string | boolean | undefined>>({
  icon: Icon,
  type,
  placeholder,
  register,
  control,
  name,
  error,
  className,
  disabled = false,
}: FormInputProps<T>) => {
  // If control is provided, use Controller for better validation handling
  if (control) {
    return (
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
            <Input
              type={type}
              placeholder={placeholder}
              className={cn(
                "pl-10 bg-background",
                error && "border-destructive focus-visible:ring-destructive",
                disabled && "opacity-50 cursor-not-allowed",
                className
              )}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${String(name)}-error` : undefined}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                // Mark as touched to trigger validation
                field.onBlur();
              }}
            />
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
  }

  // Fallback to register pattern if no control is provided
  return (
    <div className="relative">
      <Icon
        className={cn(
          "absolute left-3 top-2.5 h-5 w-5",
          error ? "text-destructive" : "text-muted-foreground",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />
      <Input
        type={type}
        placeholder={placeholder}
        className={cn(
          "pl-10 bg-background",
          error && "border-destructive focus-visible:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${String(name)}-error` : undefined}
        {...register(name, {
          onChange: (e) => {
            // This will help trigger validation on change
            const event = e as React.ChangeEvent<HTMLInputElement>;
            return event;
          }
        })}
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
};